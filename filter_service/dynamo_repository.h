#ifndef DYNAMO_REPOSITORY_H
#define DYNAMO_REPOSITORY_H

#include <aws/core/Aws.h>
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
	    Aws::String _keyName;
	    Aws::UniquePtr<Aws::DynamoDB::DynamoDBClient> dynamoClient;
        Aws::Client::ClientConfiguration clientConfig;
        PhTreePostsDB& _postdb;

    public:
        ScopedDynamoTable(const char* name, PhTreePostsDB& postdb): _name(name), _postdb(postdb)  {
            clientConfig.proxyHost = "localhost";
            clientConfig.proxyPort = 8000;
            clientConfig.proxyScheme = Aws::Http::Scheme::HTTP;
            dynamoClient = Aws::MakeUnique<Aws::DynamoDB::DynamoDBClient>("Dynamo Alloc", clientConfig);
        }

        void get_all_posts_from_dynamo() {
            Aws::Map<Aws::String, Aws::DynamoDB::Model::AttributeValue> exclusiveStartKey;
            do {
                Aws::DynamoDB::Model::ScanRequest scanRequest;
                scanRequest.SetTableName(_name);
                scanRequest.SetFilterExpression("begins_with(PK, p)");

                if (!exclusiveStartKey.empty()) {
                    scanRequest.SetExclusiveStartKey(exclusiveStartKey);
                }

                const Aws::DynamoDB::Model::ScanOutcome &result = dynamoClient->Scan(scanRequest);
                if (result.IsSuccess()) {
                    const Aws::Vector<Aws::Map<Aws::String, Aws::DynamoDB::Model::AttributeValue>> &items = result.GetResult().GetItems();
                    if (!items.empty()) {
                        for (size_t i = 0; i < items.size(); ++i) {
                            Aws::String::size_type sz = 0;
                            std::string username = std::string(items[0].find("PK")->second.GetS().substr(2));
                            int64_t timestamp = std::stoll(items[0].find("SK")->second.GetN().c_str(), &sz, 10);
                            int64_t lat = std::stoll(items[0].find("Latitude")->second.GetN().c_str(), &sz, 10);
                            int64_t lon = std::stoll(items[0].find("Longitude")->second.GetN().c_str(), &sz, 10);
                            std::string chan1 = std::string(items[0].find("Channel1")->second.GetS());
                            std::string chan2 = std::string(items[0].find("Channel1")->second.GetS());
                            int64_t votes = std::stoll(items[0].find("Votes")->second.GetN().c_str(), &sz, 10);
                            _postdb.add_post(username, timestamp, lat, lon, chan1, chan2, votes);
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
                    std::cerr << "Failed to Scan posts: "
                                << result.GetError().GetMessage() << std::endl;
                }
            } while (!exclusiveStartKey.empty());
        }

};

#endif   // DYNAMO_REPOSITORY_H