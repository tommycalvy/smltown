#include <grpc/grpc.h>
#include <grpcpp/server.h>
#include <grpcpp/server_builder.h>
#include <grpcpp/server_context.h>
#include <grpcpp/security/server_credentials.h>
#include "protos/filter_service.grpc.pb.h"
#include "phtree_posts.h"

using grpc::Server;
using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::ServerReader;
using grpc::ServerWriter;
using grpc::Status;
using filterservice::FilterService;


class FilterServiceImpl final : public FilterService::Service {
  private:
    PostMap pMap;
    PhTreePostsDB& _phTree;

  public:
    FilterServiceImpl(PhTreePostsDB& phTree): _phTree(phTree)  {
        
    }


    Status CreatePost(ServerContext* context, const filterservice::Post* nPost, filterservice::Post* cPost) override {
        
        std::string username = nPost->username();
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
        _phTree.add_post(std::string username, int64_t time, int64_t lat, int64_t lon, std::string chan1, std::string chan2, int64_t votes)
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