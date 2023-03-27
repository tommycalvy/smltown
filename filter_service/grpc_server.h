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
            
            PhTreePostsDB::Post p = {
                .username = nPost->username(),
                .timestamp = nPost->timestamp(),
                .latitude = nPost->latitude(),
                .longitude = nPost->longitude(),
                .channel1 = nPost->channel1(),
                .channel2 = nPost->channel2(),
                .votes = nPost->votes(),
            };

            int success = _postdb.add_post(p);
            if (success < 0) {
                std::cout << "Error adding post!" << std::endl;
                res->set_success(false);
                return Status(grpc::StatusCode::INTERNAL, "Error adding post!");
            }
            
            std::cout << "Post Added!" << std::endl;
            //_postdb.print_post(p);
            res->set_success(true);
            return Status::OK;
        }

        // Create a function that overrides the 
        // GetHotPostsNearMe function in the FilterService class
        Status GetHotPostsNearMe(ServerContext* context, const filterservice::Filters *filters, filterservice::Response *res) override {
            // Get the filters from the request
            std::string username = filters->username();
            double latitude = filters->latitude();
            double longitude = filters->longitude();
            double radius = filters->radius();
            int channel1 = filters->channel1();
            int channel2 = filters->channel2();
            int votes = filters->votes();
            int limit = filters->limit();

            // Create a vector of posts
            std::vector<PhTreePostsDB::Post> posts;

            // Call the get_hot_posts_near_me function
            int success = _postdb.get_hot_posts_near_me(username, latitude, longitude, radius, channel1, channel2, votes, limit, posts);

            // Check if the function was successful
            if (success < 0) {
                std::cout << "Error getting hot posts near me!" << std::endl;
                res->set_success(false);
                return Status(grpc::StatusCode::INTERNAL, "Error getting hot posts near me!");
            }

            // Add the posts to the response
            for (auto post : posts) {
                filterservice::Post* nPost = res->add_posts();
                nPost->set_username(post.username);
                nPost->set_timestamp(post.timestamp);
                nPost->set_latitude(post.latitude);
                nPost->set_longitude(post.longitude);
                nPost->set_channel1(post.channel1);
                nPost->set_channel2(post.channel2);
                nPost->set_votes(post.votes);
            }

            // Set the success flag to true
            res->set_success(true);

            // Return the status
            return Status::OK;
        }


        Status Count(ServerContext* context, const filterservice::Post* post, filterservice::Response* res) override {

            PhTreePostsDB::Post p = {
                .username = post->username(),
                .timestamp = post->timestamp(),
                .latitude = post->latitude(),
                .longitude = post->longitude(),
                .channel1 = post->channel1(),
                .channel2 = post->channel2(),
                .votes = post->votes(),
            };
            int success = _postdb.count(p)
            //res->
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






    