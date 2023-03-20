#ifndef PHTREE_POSTS_H
#define PHTREE_POSTS_H

#include "phtree/phtree.h"
#include "phtree/phtree_multimap.h"
#include <unordered_map>
#include <iostream>
#include <functional>

using namespace improbable::phtree;

template<typename K, typename V>
void print_map(std::unordered_map<K, V> const &m)
{
    for (auto const &pair: m) {
        std::cout << "{" << pair.first << ": " << pair.second << "}\n";
    }
}

class PhTreePostsDB {
  private:

    struct PostEntry {
        std::string                                                     id;
        v16::Entry<6, b_plus_tree_hash_set<PostEntry*>, scalar_64_t>*   entry;
    };

    struct PostID {
        std::string         username;
        int64_t             timestamp;
    };

    using PostMap = std::unordered_map<std::string, PostEntry*>;
    using PhTreeMM = PhTreeMultiMap<6, PostEntry*>;

    PostMap pMap;
    PhTreeMM phTree;


  public:
    PhTreePostsDB() {
        phTree = PhTreeMM();
    }


    int add_post(std::string username, int64_t time, int64_t lat, int64_t lon, std::string chan1, std::string chan2, int64_t votes) {
        std::string id = username + std::to_string(time);
        std::hash<std::string> str_hash;
        int64_t chan1hash = str_hash(chan1);
        int64_t chan2hash = str_hash(chan2);
        PostEntry *post = new PostEntry({id, NULL});
        PhPoint<6> p({time, lat, lon, chan1hash, chan2hash, votes});
        std::cout << "Post ID: " << post->id << std::endl;
        std::cout << "Post mem: " << post << std::endl;
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

    //TODO: Create unordered map of hash to channel name

    /*
    std::vector<class Tp> get_hot_posts(int64_t timestamp, int64_t lat, int64_t lon, int64_t chan1, int64_t chan2, int64_t range) {
        
    }
    */
};

#endif  // PHTREE_POSTS_H