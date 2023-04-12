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

For filter_service:
bazel run --config=linux_arm64 //filter_service:amazon_image
docker run --name filter_service --rm -it -p50051:50051 --env-file filter_service/.env bazel/filter_service:amazon_image

For crud_service:
bazel run --platforms=@io_bazel_rules_go//go/toolchain:linux_arm64 //crud_service:amazon_image
docker run \
    --name crud_service \
    --link filter_service \
    --link dynamodb-local \
    --rm -it -p5656:5656 \
    --env-file crud_service/.env \
    bazel/crud_service:amazon_image


For sveltekit: 
docker build --no-cache -t sveltekit-docker:latest .
docker run -it --rm --name sveltekit-docker -p 3000:3000 --env-file sveltekit/.env sveltekit-docker:latest 