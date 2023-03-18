#include <aws/core/Aws.h>
#include <aws/dynamodb/DynamoDBClient.h>
#include <aws/dynamodb/model/ScanRequest.h>
#include <iostream>

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

    public:
        ScopedDynamoTable(const char* name): _name(name) {
            clientConfig.proxyHost = "localhost";
            clientConfig.proxyPort = 8000;
            clientConfig.proxyScheme = Aws::Http::Scheme::HTTP;
            dynamoClient = Aws::MakeUnique<Aws::DynamoDB::DynamoDBClient>("Dynamo Alloc", clientConfig);
        }

        void get_all_posts() {
            Aws::Map<Aws::String, Aws::DynamoDB::Model::AttributeValue> exclusiveStartKey;
            do {
                Aws::DynamoDB::Model::ScanRequest scanRequest;
                scanRequest.SetTableName(_name);
                scanRequest.SetFilterExpression("begins_with(PK, post)");

                if (!exclusiveStartKey.empty()) {
                    scanRequest.SetExclusiveStartKey(exclusiveStartKey);
                }

                const Aws::DynamoDB::Model::ScanOutcome &result = dynamoClient->Scan(scanRequest);
                if (result.IsSuccess()) {
                    const Aws::Vector<Aws::Map<Aws::String, Aws::DynamoDB::Model::AttributeValue>> &items = result.GetResult().GetItems();
                    if (!items.empty()) {
                        for (size_t i = 0; i < items.size(); ++i) {
                            //std::cout << items[i] << std::endl;
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