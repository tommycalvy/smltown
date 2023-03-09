# Bazel bootstrapping

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive", "http_file")

# Rules Proto GRPC Boilerplate

http_archive(
    name = "rules_proto_grpc",
    sha256 = "fb7fc7a3c19a92b2f15ed7c4ffb2983e956625c1436f57a3430b897ba9864059",
    strip_prefix = "rules_proto_grpc-4.3.0",
    urls = ["https://github.com/rules-proto-grpc/rules_proto_grpc/archive/4.3.0.tar.gz"],
)

load("@rules_proto_grpc//:repositories.bzl", "rules_proto_grpc_repos", "rules_proto_grpc_toolchains")

rules_proto_grpc_toolchains()

rules_proto_grpc_repos()

load("@rules_proto//proto:repositories.bzl", "rules_proto_dependencies", "rules_proto_toolchains")

rules_proto_dependencies()

rules_proto_toolchains()

load("@rules_proto_grpc//cpp:repositories.bzl", rules_proto_grpc_cpp_repos = "cpp_repos")

rules_proto_grpc_cpp_repos()

load("@com_github_grpc_grpc//bazel:grpc_deps.bzl", "grpc_deps")

grpc_deps()

load("@com_github_grpc_grpc//bazel:grpc_extra_deps.bzl", "grpc_extra_deps")

grpc_extra_deps()



http_archive(
    name = "aws-c-event-stream",
    build_file = "//third_party:aws-c-event-stream.BUILD",
    sha256 = "a1384c1f63c82a0a0bc64c3e1bc2a672c75614940b71418d96de9e057e31aafd",
    strip_prefix = "aws-c-event-stream-0.2.20",
    urls = [
        "https://github.com/awslabs/aws-c-event-stream/archive/refs/tags/v0.2.20.tar.gz",
    ],
)






http_archive(
    name = "aws-c-cal",
    build_file = "//third_party:aws-c-cal.BUILD",
    sha256 = "525a84732cdd549842575502d59e10d2a10b23aa556a2318326e344be76bc6c8",
    strip_prefix = "aws-c-cal-0.5.21",
    urls = [
        "https://github.com/awslabs/aws-c-cal/archive/refs/tags/v0.5.21.tar.gz",
    ],
)

http_archive(
    name = "aws-c-common",
    build_file = "//third_party:aws-c-common.BUILD",
    sha256 = "5a3d4bf1bdacf13964885d4f40113d379d8eaad5286e81ec5d6c64f9313cf82d",
    strip_prefix = "aws-c-common-0.8.14",
    urls = [
        "https://github.com/awslabs/aws-c-common/archive/refs/tags/v0.8.14.tar.gz",
    ],
)

http_archive(
    name = "aws-c-io",
    build_file = "//third_party:aws-c-io.BUILD",
    sha256 = "7a6a701fd9ae58d1a4d939e9c3cf8f86c5ebbfc05fd08a9891ddaecd55e4a716",
    strip_prefix = "aws-c-io-0.13.18",
    urls = [
        "https://github.com/awslabs/aws-c-io/archive/refs/tags/v0.13.18.tar.gz",
    ],
)

http_archive(
    name = "aws-crt-cpp",
    build_file = "//third_party:aws-crt-cpp.BUILD",
    sha256 = "24a6be93d663d0cd2c5811865d488d30154f2738bea5b7836a5a8c1f01cb8457",
    strip_prefix = "aws-crt-cpp-0.19.8",
    urls = [
        "https://github.com/awslabs/aws-crt-cpp/archive/refs/tags/v0.19.8.tar.gz",
    ],
)

http_archive(
    name = "aws-sdk-cpp",
    build_file = "//third_party:aws-sdk-cpp.BUILD",
    sha256 = "94f46fd71d4ab679628ef7c4cfcdffe0489dd14f3fbbf913f67138f7e88ff530",
    strip_prefix = "aws-sdk-cpp-1.11.33",
    urls = [
        "https://github.com/aws/aws-sdk-cpp/archive/refs/tags/1.11.33.tar.gz",
    ],
)