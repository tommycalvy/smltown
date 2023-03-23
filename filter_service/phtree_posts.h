#ifndef PHTREE_POSTS_H
#define PHTREE_POSTS_H

#include "phtree/phtree.h"
#include "phtree/phtree_multimap.h"
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
        int64_t         latitude;
        int64_t         longitude;
        std::string     channel1;
        std::string     channel2;
        int64_t         votes;
    };


    int add_post(Post p) {

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
        
        PhPoint<7> key({
            usernameCode, 
            p.latitude, 
            p.longitude, 
            channel1Code, 
            channel2Code, 
            p.votes
        });
        

        auto pair1 = pMap.emplace(post->id, post);
        print_map(pMap);
        if (!pair1.second) {
            std::cout << "Couldn't Insert into unordered map named pMap" << std::endl;
            delete post;
            return -1;
        }
        auto pair2 = phTree.emplace_e(p, post);
        if (!pair2.second) {
            std::cout << "Couldn't insert into PhTree named phTree" << std::endl;
            pMap.erase(post->id);
            delete post;
            return -1;
        }
        post->entry = pair2.first;
        return 0;
    }

    int print_post(std::string username, int64_t time) {
        std::string id = username + std::to_string(time);
        PostMap::const_iterator got = pMap.find(id);
        if (got == pMap.end()) {
            std::cout << id << " not found" << std::endl;
            return -1;
        }
        auto key = got->second->entry->GetKey();
        auto iter = phTree.find(key);
        if (iter == phTree.end()) {
            std::cout << "Couldn't find value from key: " << key << " from postid: " << got->first << std::endl;
            return -1;
        }
        PostEntry *post = iter.operator*();
        if (post->id != got->first) {
            std::cout << post->id << " != " << got->first << " Post Ids Not Equal!" << std::endl;
            return -1;
        }
        std::cout << "PostID:          " << post->id << std::endl;
        std::cout << "Timestamp:       " << key[0] << std::endl;
        std::cout << "Latitude:        " << key[1] << std::endl;
        std::cout << "Longitude:       " << key[2] << std::endl;
        std::cout << "Channel1Hash:    " << key[3] << std::endl;
        std::cout << "Channel2Hash:    " << key[4] << std::endl;
        std::cout << "Votes:           " << key[5] << std::endl;
        return 0;
    }

    PhPost get_post(std::string username, int64_t time) {
        std::string id = username + std::to_string(time);
        PostMap::const_iterator got = pMap.find(id);
        if (got == pMap.end()) {
            std::cout << id << " not found" << std::endl;
            return PhPost{};
        }
        auto key = got->second->entry->GetKey();
        auto iter = phTree.find(key);
        if (iter == phTree.end()) {
            std::cout << "Couldn't find value from key: " << key << " from postid: " << got->first << std::endl;
            return PhPost{};
        }
        PostEntry *post = iter.operator*();
        if (post->id != got->first) {
            std::cout << post->id << " != " << got->first << " Post Ids Not Equal!" << std::endl;
            return PhPost{};
        }
        return PhPost{username, key[0], key[1], key[2], post->channel1, post->channel2, key[5]};
    }

    //TODO: Create unordered map of hash to channel name

    std::vector<PostID> get_hot_posts(int64_t timestamp, int64_t lat, int64_t lon, std::string chan1, std::string chan2, int64_t range) {
        for (auto it : phTree.begin_knn_query(5, {1, 1, 1}, DistanceEuclidean<3>())); it != phTree.end(); ++it) {

        }
    }

    template <dimension_t DIM, typename T>
    struct FilterByValueId {
        [[nodiscard]] constexpr bool IsEntryValid(const PhPoint<DIM>& key, const T& value) const {
            // Arbitrary example: Only allow values with even values of id_
            return value.id_ % 2 == 0;
        }
        [[nodiscard]] constexpr bool IsNodeValid(const PhPoint<DIM>& prefix, int bits_to_ignore) const {
            // Allow all nodes
            return true;
        }
    };

    int64_t distance(int64_t lat1, int64_t lon1, int64_t lat2, int64_t lon2) {
        const double p = 0.017453292519943295;    // Math.PI / 180
        double a = 0.5 - cos((lat2 - lat1) * p)/2 + cos(lat1 * p) * cos(lat2 * p) * (1 - cos((lon2 - lon1) * p))/2;

        return 12742 * asin(sqrt(a)); // 2 * R; R = 6371 km
    }
    
};

#endif  // PHTREE_POSTS_H