#include <string>
#include <functional>
#include <unordered_map>
#include <iostream>
#include "dynamo_repository.h"
#include "grpc_server.h"
#include "phtree_posts.h"



int main() {
    PhTreePostsDB postdb = PhTreePostsDB();
    ScopedAwsSDK sdkScoped;
	{
		ScopedDynamoTable table("SMLTOWN", postdb);
		table.get_all_posts_from_dynamo();
	}
    RunServer(postdb);
    return 0;
}