#include <string>
#include <unordered_map>
#include <iostream>
#include "phtree/phtree.h"
#include "phtree/phtree_multimap.h"

#include <grpc/grpc.h>
#include <grpcpp/server.h>
#include <grpcpp/server_builder.h>
#include <grpcpp/server_context.h>
#include <grpcpp/security/server_credentials.h>
#include "protos/filter_service.grpc.pb.h"

using namespace improbable::phtree;

using grpc::Server;
using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::ServerReader;
using grpc::ServerWriter;
using grpc::Status;



struct PostEntry {
    std::string                                                     id;
    v16::Entry<2, b_plus_tree_hash_set<PostEntry*>, scalar_64_t>*      entry;
};

using PostMap = std::unordered_map<std::string, PostEntry*>;
using PhTreeMM = PhTreeMultiMap<2, PostEntry*>;


int get_posts() {
    
    return 0;
}

template<typename K, typename V>
void print_map(std::unordered_map<K, V> const &m)
{
    for (auto const &pair: m) {
        std::cout << "{" << pair.first << ": " << pair.second << "}\n";
    }
}

int add_post(PostMap& pMap, PhTreeMM& phTree, PostEntry *post, PhPoint<2>& point) {
    std::cout << "Post ID: " << post->id << std::endl;
    std::cout << "Post mem: " << post << std::endl;
    auto pair1 = pMap.emplace(post->id, post);
    print_map(pMap);
    if (!pair1.second) {
        std::cout << "Couldn't Insert into unordered map named pMap" << std::endl;
        delete post;
        return -1;
    }
    auto pair2 = phTree.emplace_e(point, post);
    if (!pair2.second) {
        std::cout << "Couldn't insert into PhTree named phTree" << std::endl;
        pMap.erase(post->id);
        delete post;
        return -1;
    }
    post->entry = pair2.first;
    return 0;
}

std::string gen_random(const int len) {
    static const char alphanum[] =
        "0123456789"
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        "abcdefghijklmnopqrstuvwxyz";
    std::string tmp_s;
    tmp_s.reserve(len);

    for (int i = 0; i < len; ++i) {
        tmp_s += alphanum[rand() % (sizeof(alphanum) - 1)];
    }
    
    return tmp_s;
}



std::string create_rand_post(PostMap& postMap, PhTreeMM& phTree) {
    std::string id = gen_random(12);
    PostEntry *post = new PostEntry({id, NULL});
    PhPoint<2> p1({rand() % 100000, rand() % 100000});
    add_post(postMap, phTree, post, p1);
    return id;
}

class FilterServiceImpl final : public FilterService::Service {
    
    Status CreatePost(ServerContext* context, const Post* postP, Post* postS) override {
        std::cout << "Created PostID: " << postP->postid() << std::endl;
        std::cout << "Latitude: " << postP->filters().attributes().location().latitude() << std::endl;
        postS->set_allocated_postid(postP->postid());
        postS->set_allocated_filters(postP->filters());
        return Status::OK;
    }
};



std::string getServerAddress() {
  std::string server_host("0.0.0.0");
  std::string server_port("50051");
  if (std::getenv("SERVER_PORT")) {
    server_port = std::getenv("SERVER_PORT");
  }
  std::string server_address = server_host + ":" + server_port;
  return server_address;
}


void RunServer() {
  std::string server_address("0.0.0.0:50051");
  FilterServiceImpl service();

  ServerBuilder builder;
  builder.AddListeningPort(server_address, grpc::InsecureServerCredentials());
  builder.RegisterService(&service);
  std::unique_ptr<Server> server(builder.BuildAndStart());
  std::cout << "Server listening on " << server_address << std::endl;
  server->Wait();
}


void phtree_test() {
    int numPosts = 10;
    PostMap pMap;
    auto tree = PhTreeMM();
    
    std::vector<std::string> ids;
    ids.reserve(numPosts);
    for (int i = 0; i < numPosts; i++) {
        std::string id = create_rand_post(pMap, tree);
        ids.emplace_back(id);
    }

    for (int i = 0; i < 10; i++) {
        std::string id = ids.back();
       
        PostMap::const_iterator got = pMap.find(id);
        if (got == pMap.end()) {
            std::cout << id << " not found" << std::endl;
            continue;
        }
        ids.pop_back();
        auto key = got->second->entry->GetKey();
        std::cout << "Key: " << got->first << " Value: " << got->second->entry->GetKey() << std::endl;
        auto iter = tree.find(key);
        if (iter == tree.end()) {
            std::cout << "Couldn't find key: " << key << " from postid: " << got->first << std::endl;
            continue;
        }
        PostEntry *post = iter.operator*();
        if (post->id == got->first) {
            std::cout << post->id << " == " << got->first << " Post Ids Equal!" << std::endl;
        } else {
            std::cout << post->id << " != " << got->first << " Post Ids Not Equal!" << std::endl;
        }
        
    }

    for (auto post : pMap) {
        delete post.second;
    }
}

int main() {
    
    RunServer();
    return 0;
}