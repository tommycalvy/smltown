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
		Aws::SDKOptions sdk_options;
		sdk_options.loggingOptions.logLevel = Aws::Utils::Logging::LogLevel::Info;
		Aws::InitAPI(sdk_options);
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
        Aws::Client::ClientConfiguration clientConfig;
        PhTreePostsDB& _postdb;
        Aws::DynamoDB::DynamoDBClient dynamoClient;
        Aws::String AWS_ACCESS_KEY_ID     = "XXXXXXXXXXXXXXXXXXXX";
        Aws::String AWS_SECRET_ACCESS_KEY = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
        Aws::Auth::AWSCredentials credentials;

    public:
        ScopedDynamoTable(const char* name, PhTreePostsDB& postdb): _name(name), _postdb(postdb) {
            credentials = Aws::Auth::AWSCredentials(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY);
            clientConfig.endpointOverride = Aws::String("http://localhost:8000");
            clientConfig.region = Aws::Region::US_EAST_1;
            //clientConfig.requestTimeoutMs = 1000;
            //clientConfig.proxyHost = "localhost";
            //clientConfig.proxyPort = 8000;
            //clientConfig.proxyScheme = Aws::Http::Scheme::HTTP;
            clientConfig.scheme = Aws::Http::Scheme::HTTP;
            Aws::DynamoDB::DynamoDBClient dynamoClient = Aws::DynamoDB::DynamoDBClient(credentials, clientConfig);
        }

        void get_all_posts_from_dynamo() {
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
                    std::cout << "Failed to Scan posts: " << result.GetError().GetMessage() << std::endl;
                }
            } while (!exclusiveStartKey.empty());
        }

};

#endif   // DYNAMO_REPOSITORY_H