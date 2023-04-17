SMLTOWN
=======

The front page of your town
---------------------------

It's basically a location-based reddit, but the subreddits are more like twitter hashtags. This allows for organic
community creation specific to each town. 

To configure Go dependecies run:
bazel run //:gazelle

To make generated and external files available for c++ files:
bazel run :refresh_compile_commands


To build and test the docker images locally, run:

For Ory Kratos (for local development):
bazel run //ory/kratos:local_image

For Ory Kratos (for production):
bazel run //ory/kratos:amazon_image

For filter_service:
bazel run //filter_service:amazon_image --config=linux_arm64 

For crud_service:
bazel run //crud_service:amazon_image --platforms=@io_bazel_rules_go//go/toolchain:linux_arm64 

For sveltekit: 
docker build ./sveltekit --no-cache -t sveltekit-docker:latest

Then from root directory run:
docker-compose up

