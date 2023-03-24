#ifndef PHTREE_POSTS_H
#define PHTREE_POSTS_H

#include "phtree/phtree.h"
#include <unordered_map>
#include <iostream>
#include <functional>
#include <math.h>

using namespace improbable::phtree;

class PhTreePostsDB {
  private:
    std::unordered_map<std::string, int64_t> channelToCodeMap;
    std::unordered_map<int64_t, std::string> codeToChannelMap;
    std::unordered_map<std::string, int64_t> usernameToCodeMap;
    PhTree<7, std::string*> phtree;

  public:
    PhTreePostsDB() {
        phtree = PhTree<7, std::string*>();
    }

    struct PostID {
        std::string         username;
        int64_t             timestamp;
    };

    struct Post {
        std::string     username;
        int64_t         timestamp;
        std::string     latitude;
        std::string     longitude;
        std::string     channel1;
        std::string     channel2;
        int64_t         votes;
    };

    struct Filter {
        std::string     username;
        int64_t         timestamp; 
        std::string     latitude; 
        std::string     longitude; 
        std::string     channel1; 
        std::string     channel2; 
        int64_t         range;
        int64_t         minResults;
    };

    PhPoint<7> post_to_key(Post p) {
        int64_t usernameCode;
        if (usernameToCodeMap.count(p.username)) {
            usernameCode = usernameToCodeMap.at(p.username);
        } else {
            usernameCode = usernameToCodeMap.size() + 1;
            usernameToCodeMap[p.username] = usernameCode;
        }

        int64_t channel1Code;
        if (channelToCodeMap.count(p.channel1)) {
            channel1Code = channelToCodeMap.at(p.channel1);
        } else {
            channel1Code = channelToCodeMap.size() + 1;
            channelToCodeMap[p.channel1] = channel1Code;
        }

        int64_t channel2Code;
        if (channelToCodeMap.count(p.channel2)) {
            channel2Code = channelToCodeMap.at(p.channel2);
        } else {
            channel2Code = channelToCodeMap.size() + 1;
            channelToCodeMap[p.channel2] = channel2Code;
        }

        int64_t latitude = int64_t((std::stod(p.latitude) + 90) * 1000);
        int64_t longitude = int64_t((std::stod(p.longitude) + 180) * 1000);

        // Change votes so that 0 is a lot and a lot is 0
        // floor(100,000/x)
        int64_t votes = int64_t(floor(100000 / double(p.votes)));

        PhPoint<7> key({
            usernameCode,
            latitude, 
            longitude, 
            channel1Code, 
            channel2Code, 
            votes,
        });

        return key;
    }

    int add_post(Post p) {

        PhPoint<7> key = post_to_key(p);        

        std::string* value = new std::string(p.username);

        auto pair = phtree.emplace(key, value);
        if (!pair.second) {
            std::cout << "Couldn't insert into PhTree named phTree" << std::endl;
            return -1;
        }
        return 0;
    }

    int print_post(Post p) {
        
        PhPoint<7> key = post_to_key(p);  

        auto iter = phtree.find(key);
        if (iter == phtree.end()) {
            std::cout << "Couldn't find value from key: " << key << std::endl;
            return -1;
        }
        std::cout << "UsernameCode:    " << key[0] << std::endl;
        std::cout << "Timestamp:       " << key[1] << std::endl;
        std::cout << "LatitudeMult:    " << key[2] << std::endl;
        std::cout << "LongitudeMult:   " << key[3] << std::endl;
        std::cout << "Channel1Code:    " << key[4] << std::endl;
        std::cout << "Channel2Code:    " << key[5] << std::endl;
        std::cout << "VotesInverted:   " << key[6] << std::endl;
        return 0;
    }

    int count(Post p) {
        PhPoint<7> key = post_to_key(p);  

        auto iter = phtree.find(key);
        if (iter == phtree.end()) {
            std::cout << "Couldn't find value from key: " << key << std::endl;
            return 0;
        }
        return 1;
    }

    

    std::vector<PostID> get_hot_posts(Filter f) {
        std::vector<PostID> postids;
        for (auto it = phtree.begin_knn_query(f.minResults, {0, f.timestamp, 0, 0, 0, 0, 0}, DistanceHot()); it != phtree.end(); ++it) {
            PostID postid = { *it.second(), it.first().at(1)};
            postids.push_back(postid);
        } 
        return postids;
    }

    // Only calculates distance for timestamp and votes
    struct DistanceHot {
        double operator()(const PhPoint<7>& v1, const PhPoint<7>& v2) const noexcept {

            PhPoint<2> v1hot({ v1[1], v1[6]});
            PhPoint<2> v2hot({v2[1], v2[6]});

            double sum2 = 0;
            for (dimension_t i = 0; i < 2; ++i) {
                assert(
                    (v1hot[i] >= 0) != (v2hot[i] >= 0) ||
                    double(v1hot[i]) - double(v2hot[i]) <
                        double(std::numeric_limits<decltype(v1hot[i] - v2hot[i])>::max()));
                double d2 = double(v1hot[i] - v2hot[i]);
                sum2 += d2 * d2;
            }
            return sqrt(sum2);
        };
    };

    template <dimension_t DIM, typename T>
    struct FilterByValueId {
        [[nodiscard]] constexpr bool IsWithinGeoRange(const PhPoint<DIM>& key, const T& value) const {
            // Arbitrary example: Only allow values with even values of id_
            return value.id_ % 2 == 0;
        }
    };

    int64_t geo_distance(int64_t lat1, int64_t lon1, int64_t lat2, int64_t lon2) {
        const double p = 0.017453292519943295;    // Math.PI / 180
        double a = 0.5 - cos((lat2 - lat1) * p)/2 + cos(lat1 * p) * cos(lat2 * p) * (1 - cos((lon2 - lon1) * p))/2;

        return 12742 * asin(sqrt(a)); // 2 * R; R = 6371 km
    }
    
};

#endif  // PHTREE_POSTS_H