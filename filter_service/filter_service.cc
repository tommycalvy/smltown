#include <string>
#include <functional>
#include <unordered_map>
#include <iostream>
#include "dynamo_repository.h"
#include "grpc_server.h"
#include "phtree_posts.h"
#include <signal.h>


void signal_callback_handler(int signum) {
   std::cout << "Caught signal " << signum << std::endl;
   // Terminate program
   exit(signum);
}

int main() {
    std::cout << "Running Filter Service" << std::endl;
    PhTreePostsDB postdb = PhTreePostsDB();
    
    const char* table_name = std::getenv("AWS_TABLE_NAME");
    
    ScopedAwsSDK sdkScoped;
	{
		ScopedDynamoTable table(table_name, postdb);
		table.get_all_posts_from_dynamo();
	}
    
    postdb.print_total_posts();

    signal(SIGINT, signal_callback_handler);
    signal(SIGTERM, signal_callback_handler);
    signal(SIGKILL, signal_callback_handler);
    RunServer(postdb);
    return 0;
}