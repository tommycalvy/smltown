#include <string>
#include <functional>
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
using filterservice::FilterService;

// PhPoint<6> p({time, latitude, longitude, channel1, channel2, upVotes})

struct PostEntry {
    std::string                                                     id;
    v16::Entry<6, b_plus_tree_hash_set<PostEntry*>, scalar_64_t>*   entry;
};

using PostMap = std::unordered_map<std::string, PostEntry*>;
using PhTreeMM = PhTreeMultiMap<6, PostEntry*>;

template<typename K, typename V>
void print_map(std::unordered_map<K, V> const &m)
{
    for (auto const &pair: m) {
        std::cout << "{" << pair.first << ": " << pair.second << "}\n";
    }
}

int add_post(PostMap& pMap, PhTreeMM& phTree, PostEntry *post, PhPoint<6>& point) {
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

class FilterServiceImpl final : public FilterService::Service {
  private:
    PostMap pMap;
    PhTreeMM phTree;

  public:
    FilterServiceImpl() {
        phTree = PhTreeMM();
    }


    Status CreatePost(ServerContext* context, const filterservice::Post* nPost, filterservice::Post* cPost) override {
        
        std::string id = nPost->id();
        int64_t time = nPost->time();
        int64_t lat = nPost->latitude();
        int64_t lon = nPost->longitude();
        int64_t chan1 = std::hash<std::string>{}(nPost->channel1());
        int64_t chan2 = std::hash<std::string>{}(nPost->channel2());
        int64_t votes = nPost->upvotes();
        //std::cout << "Created New Post with ID: " << postP->postid() << std::endl;
        //std::cout << "Latitude: " << postP->filters().attributes().location().latitude() << std::endl;
        //cPost->set_id
        PostEntry *post = new PostEntry({id, NULL});
        PhPoint<6> p({time, lat, lon, chan1, chan2, votes});
        add_post(pMap, phTree, post, p);
        PostMap::const_iterator got = pMap.find(id);
        if (got == pMap.end()) {
            std::cout << id << " not found" << std::endl;
            return Status(grpc::StatusCode::INTERNAL, "Error creating post");
        } 
        auto key = got->second->entry->GetKey();
        auto iter = phTree.find(key);
        if (iter == phTree.end()) {
            std::cout << "Couldn't find key: " << key << " from postid: " << got->first << std::endl;
            return Status(grpc::StatusCode::INTERNAL, "Error creating post");
        }
        PostEntry *phpost = iter.operator*();
        if (phpost->id != got->first) {
            std::cout << phpost->id << " != " << got->first << " Post Ids Not Equal!" << std::endl;
            return Status(grpc::StatusCode::INTERNAL, "Error creating post");
        }
        cPost->set_id(phpost->id);
        cPost->set_time(key[0]);
        cPost->set_latitude(key[1]);
        cPost->set_longitude(key[2]);
        cPost->set_channel1(nPost->channel1());
        cPost->set_channel2(nPost->channel2());
        cPost->set_upvotes(key[5]);
        std::cout << "Successfully created post with id: " << id << std::endl;

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
  FilterServiceImpl service;

  ServerBuilder builder;
  builder.AddListeningPort(server_address, grpc::InsecureServerCredentials());
  builder.RegisterService(&service);
  std::unique_ptr<Server> server(builder.BuildAndStart());
  std::cout << "Server listening on " << server_address << std::endl;
  server->Wait();
}

int main() {
    
    RunServer();
    return 0;
}