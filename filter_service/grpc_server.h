#ifndef GRPC_SERVER_H
#define GRPC_SERVER_H

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
using grpc::Status;
using filterservice::FilterService;


class FilterServiceImpl final : public FilterService::Service {
    private:
        PhTreePostsDB& _postdb;

        std::string getServerAddress() {
            std::string server_host("0.0.0.0");
            std::string server_port("50051");
            if (std::getenv("SERVER_PORT")) {
                server_port = std::getenv("SERVER_PORT");
            }
            std::string server_address = server_host + ":" + server_port;
            return server_address;
        }

    public:
        FilterServiceImpl(PhTreePostsDB& postdb): _postdb(postdb)  {
            
        }


        Status AddPost(ServerContext* context, const filterservice::Post* nPost, filterservice::Response* res) override {
            
            std::string username = nPost->username();
            int64_t time = nPost->timestamp();
            int64_t lat = nPost->latitude();
            int64_t lon = nPost->longitude();
            std::string chan1 = nPost->channel1();
            std::string chan2 = nPost->channel2();
            int64_t votes = nPost->votes();
            int success = _postdb.add_post(username, time, lat, lon, chan1, chan2, votes);
            if (success < 0) {
                std::cout << "Error adding post!" << std::endl;
                res->set_success(false);
                return Status(grpc::StatusCode::INTERNAL, "Error adding post!");
            }
            
            std::cout << "Post Added!" << std::endl;
            _postdb.print_post(username, time);
            res->set_success(true);
            return Status::OK;
        }

        Status GetPost(ServerContext* context, const filterservice::PostID* postid, filterservice::Post* gpost) override {
            PhTreePostsDB::PhPost p = _postdb.get_post(postid->username(), postid->timestamp());
            if (p.username == "") {
                return Status(grpc::StatusCode::INTERNAL, "Failed to get post!");
            }
            gpost->set_username(p.username);
            gpost->set_timestamp(p.timestamp);
            gpost->set_latitude(p.latitude);
            gpost->set_longitude(p.longitude);
            gpost->set_channel1(p.channel1);
            gpost->set_channel2(p.channel2);
            gpost->set_votes(p.votes);
            return Status::OK;
        }

        
    };

inline void RunServer(PhTreePostsDB& postdb) {
    std::string server_address("0.0.0.0:50051");
    FilterServiceImpl service = FilterServiceImpl(postdb);

    ServerBuilder builder;
    builder.AddListeningPort(server_address, grpc::InsecureServerCredentials());
    builder.RegisterService(&service);
    std::unique_ptr<Server> server(builder.BuildAndStart());
    std::cout << "Server listening on " << server_address << std::endl;
    server->Wait();
}

#endif   // GRPC_SERVER_H






    