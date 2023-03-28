#ifndef PHTREE_POSTS_H
#define PHTREE_POSTS_H

#include "phtree/phtree.h"
#include <unordered_map>
#include <iostream>
#include <functional>
#include <math.h>
#include <algorithm>

using namespace improbable::phtree;

template <typename ScalarInternal>
class FilterGeoRange {

    private:
        double lat_center_;
        double lon_center_;
        double radius_;

    public:
        FilterGeoRange(const double lat_center, const double lon_center, const double radius)
        : lat_center_{lat_center}
        , lon_center_{lon_center}
        , radius_{radius}{};

        template <typename T>
        [[nodiscard]] bool IsEntryValid(const PhPoint<7>& key, const T&) const {
            double lat_post = (double(key[2]) / 1000) - 90;
            double lon_post = (double(key[3]) / 1000) - 180;
            return geo_distance(lat_center_, lon_center_, lat_post, lon_post) <= radius_;
        }

        /*
        * Calculate whether AABB encompassing all possible points in the node intersects with the
        * sphere.
        */
        [[nodiscard]] bool IsNodeValid(const PhPoint<7>& prefix, std::uint32_t bits_to_ignore) const {
            // we always want to traverse the root node (bits_to_ignore == 64)

            if (bits_to_ignore >= (detail::MAX_BIT_WIDTH<ScalarInternal> - 1)) {
                return true;
            }

            ScalarInternal node_min_bits = detail::MAX_MASK<ScalarInternal> << bits_to_ignore;
            ScalarInternal node_max_bits = ~node_min_bits;

            
            // calculate lower and upper bound for dimension for given node
            double lat_post_lo = (double(prefix[2] & node_min_bits) / 1000) - 90;
            double lat_post_hi = (double(prefix[2] | node_max_bits) / 1000) - 90;

            // choose value closest to center for dimension
            double lat_post = std::clamp(lat_center_, lat_post_lo, lat_post_hi);

            // calculate lower and upper bound for dimension for given node
            double lon_post_lo = (double(prefix[3] & node_min_bits) / 1000) - 180;
            double lon_post_hi = (double(prefix[3] | node_max_bits) / 1000) - 180;

            // choose value closest to center for dimension
            double lon_post = std::clamp(lon_center_, lon_post_lo, lon_post_hi);
            

            return geo_distance(lat_center_, lon_center_, lat_post, lon_post) <= radius_;
        }

        // Write the distance between two points on the surface of the earth in miles
        double geo_distance(double lat1, double lon1, double lat2, double lon2) const {
            const double p = 0.017453292519943295;    // Math.PI / 180
            const double a = 0.5 - cos((lat2 - lat1) * p)/2 + 
                    cos(lat1 * p) * cos(lat2 * p) * 
                    (1 - cos((lon2 - lon1) * p))/2;
            return 7917.6 * asin(sqrt(a)); // 2 * R; R = 3,958.8 mi
        }
};

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
        int64_t         minresults;
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
            p.timestamp,
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
        double lat = std::stod(f.latitude);
        double lon = std::stod(f.longitude);
        for (auto it = phtree.begin_knn_query(f.minresults, {0, f.timestamp, 0, 0, 0, 0, 0}, DistanceHot(), FilterGeoRange<scalar_64_t>(lat, lon, double(f.range))); it != phtree.end(); ++it) {
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

    
    
};



#endif  // PHTREE_POSTS_H