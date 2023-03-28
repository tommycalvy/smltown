#include <string>
#include <functional>
#include <unordered_map>
#include <iostream>
#include "dynamo_repository.h"
#include "grpc_server.h"
#include "phtree_posts.h"



int main() {
    std::cout << "Running Filter Service" << std::endl;
    PhTreePostsDB postdb = PhTreePostsDB();
    /*
    ScopedAwsSDK sdkScoped;
	{
		ScopedDynamoTable table("SMLTOWN", postdb);
		table.get_all_posts_from_dynamo();
	}
    */
    
    //postdb.print_post();
    //postdb.print_post();
    RunServer(postdb);
    return 0;
}