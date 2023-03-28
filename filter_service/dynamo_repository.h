#ifndef DYNAMO_REPOSITORY_H
#define DYNAMO_REPOSITORY_H

#include <aws/core/Aws.h>
#include <aws/core/auth/AWSCredentialsProvider.h>
#include <aws/dynamodb/DynamoDBClient.h>
#include <aws/dynamodb/model/ScanRequest.h>
#include <iostream>
#include "phtree_posts.h"
#include <string>

struct ScopedAwsSDK {

	ScopedAwsSDK() {
		Aws::InitAPI(opts);
	}

	~ScopedAwsSDK() {
		Aws::ShutdownAPI(opts);
	}

	Aws::SDKOptions opts;
    
};

class ScopedDynamoTable {
    private:
	    Aws::String _name;
        PhTreePostsDB& _postdb;
        Aws::Client::ClientConfiguration clientConfig;

    public:
        ScopedDynamoTable(const char* name, PhTreePostsDB& postdb) : 
        _name(name), 
        _postdb(postdb)
        {
            // Set up DynamoDB client by setting the endpoint to point to a local instance of DynamoDB
            clientConfig.region = "us-east-1";
            clientConfig.endpointOverride = "localhost:8000";
            clientConfig.scheme = Aws::Http::Scheme::HTTP;
        }

        void get_all_posts_from_dynamo() {
            Aws::DynamoDB::DynamoDBClient dynamoClient(clientConfig);
            std::cout << "Getting all posts from dynamo table: " << _name << std::endl;
            Aws::Map<Aws::String, Aws::DynamoDB::Model::AttributeValue> exclusiveStartKey;
            do {
                std::cout << "Retrieving Posts" << std::endl;
                Aws::DynamoDB::Model::ScanRequest scanRequest;
                scanRequest.SetTableName(_name);
                scanRequest.SetFilterExpression("begins_with(PK, p)");

                if (!exclusiveStartKey.empty()) {
                    scanRequest.SetExclusiveStartKey(exclusiveStartKey);
                }
                std::cout << "Got here" << std::endl;
                const Aws::DynamoDB::Model::ScanOutcome &result = dynamoClient.Scan(scanRequest);
                std::cout << "But not here" << std::endl;
                if (result.IsSuccess()) {
                    std::cout << "Result is a success" << std::endl;
                    const Aws::Vector<Aws::Map<Aws::String, Aws::DynamoDB::Model::AttributeValue>> &items = result.GetResult().GetItems();
                    if (!items.empty()) {
                        std::cout << "More posts found!" << std::endl;
                        for (size_t i = 0; i < items.size(); ++i) {
                            Aws::String::size_type sz = 0;
                            PhTreePostsDB::Post p = {
                                .username = std::string(items[0].find("PK")->second.GetS().substr(2)),
                                .timestamp = std::stoll(items[0].find("SK")->second.GetN().c_str(), &sz, 10),
                                .latitude = std::string(items[0].find("Latitude")->second.GetS()),
                                .longitude = std::string(items[0].find("Longitude")->second.GetS()),
                                .channel1 = std::string(items[0].find("Channel1")->second.GetS()),
                                .channel2 = std::string(items[0].find("Channel1")->second.GetS()),
                                .votes = std::stoll(items[0].find("Votes")->second.GetN().c_str(), &sz, 10),
                            };
                            _postdb.add_post(p);
                        }
                    } else {
                        std::cout << "\nNo posts in SMLTWON database" << std::endl;
                    }

                    exclusiveStartKey = result.GetResult().GetLastEvaluatedKey();
                    if (!exclusiveStartKey.empty()) {
                        std::cout << "Not all posts were retrieved. Scanning for more."
                                    << std::endl;
                    } else {
                        std::cout << "All posts were retrieved with this scan."
                                    << std::endl;
                    }
                } else {
                    std::cout << "Failed to Scan posts: " << result.GetError().GetMessage() << std::endl;
                }
            } while (!exclusiveStartKey.empty());
        }

};

#endif   // DYNAMO_REPOSITORY_H