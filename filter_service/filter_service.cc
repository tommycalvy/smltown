#include <string>
#include <functional>
#include <unordered_map>
#include <iostream>
#include "phtree/phtree.h"
#include "phtree/phtree_multimap.h"


#include <aws/core/Aws.h>
#include <aws/dynamodb/DynamoDBClient.h>
#include <aws/dynamodb/model/ScanRequest.h>
#include <iostream>


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

void get_all_posts() {

    Aws::Client::ClientConfiguration clientConfig;
    clientConfig.proxyHost = "localhost";
    clientConfig.proxyPort = 8000;
    clientConfig.proxyScheme = Aws::Http::Scheme::HTTP;
    Aws::DynamoDB::DynamoDBClient dynamoClient(clientConfig);
    Aws::Map<Aws::String, Aws::DynamoDB::Model::AttributeValue> exclusiveStartKey;
    do {
        Aws::DynamoDB::Model::ScanRequest scanRequest;
        scanRequest.SetTableName("SMLTOWN");
        scanRequest.SetFilterExpression("begins_with(PK, post)");

        if (!exclusiveStartKey.empty()) {
            scanRequest.SetExclusiveStartKey(exclusiveStartKey);
        }

        const Aws::DynamoDB::Model::ScanOutcome &result = dynamoClient.Scan(
                scanRequest);
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
            }
            else {
                std::cout << "All posts were retrieved with this scan."
                            << std::endl;
            }
        }
        else {
            std::cerr << "Failed to Scan posts: "
                        << result.GetError().GetMessage() << std::endl;
        }
    } while (!exclusiveStartKey.empty());
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



int main() {
    
    RunServer();
    return 0;
}