# Bazel bootstrapping

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive", "http_file")

# Hedron's Compile Commands Extractor for Bazel
# https://github.com/hedronvision/bazel-compile-commands-extractor
http_archive(
    name = "hedron_compile_commands",

    # Replace the commit hash in both places (below) with the latest, rather than using the stale one here.
    # Even better, set up Renovate and let it do the work for you (see "Suggestion: Updates" in the README).
    sha256 = "10b5f7a36252ce0dd3396c289ba0138779adb6436c187266f6a93de505f3434f",
    url = "https://github.com/hedronvision/bazel-compile-commands-extractor/archive/07c307ab34d458cf0a4187a15ce1f6a2b72c408c.tar.gz",
    strip_prefix = "bazel-compile-commands-extractor-07c307ab34d458cf0a4187a15ce1f6a2b72c408c",
    # When you first run this tool, it'll recommend a sha256 hash to put here with a message like: "DEBUG: Rule 'hedron_compile_commands' indicated that a canonical reproducible form can be obtained by modifying arguments sha256 = ..."
)
load("@hedron_compile_commands//:workspace_setup.bzl", "hedron_compile_commands_setup")
hedron_compile_commands_setup()

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

# PhTree

#git_repository(
#    name = "phtree",
#    remote = "https://github.com/tommycalvy/phtree-cpp.git",
#)

http_archive(
    name = "phtree",
    sha256 = "f64baf86cefd385acd234524600e935436ff1595822aedaecaa9a211437e9985",
    strip_prefix = "phtree-cpp-1.5.0",
    url = "https://github.com/tzaeschke/phtree-cpp/archive/refs/tags/v1.5.0.tar.gz",
)


# AWS SDK CPP stuff

http_archive(
    name = "boringssl",
    patch_cmds = [
        """sed -i.bak 's/bio.c",/bio.c","src\\/decrepit\\/bio\\/base64_bio.c",/g' BUILD.generated.bzl""",
    ],
    sha256 = "a9c3b03657d507975a32732f04563132b4553c20747cec6dc04de475c8bdf29f",
    strip_prefix = "boringssl-80ca9f9f6ece29ab132cce4cf807a9465a18cfac",
    urls = [
        "https://storage.googleapis.com/mirror.tensorflow.org/github.com/google/boringssl/archive/80ca9f9f6ece29ab132cce4cf807a9465a18cfac.tar.gz",
        "https://github.com/google/boringssl/archive/80ca9f9f6ece29ab132cce4cf807a9465a18cfac.tar.gz",
    ],
)

http_archive(
    name = "aws-c-s3",
    build_file = "//third_party:aws-c-s3.BUILD",
    sha256 = "20f639c662e4c7906ef3ebdcbe6340be240eb2808a956bcfa8b0c732dae6bc90",
    strip_prefix = "aws-c-s3-0.2.6",
    urls = [
        "https://github.com/awslabs/aws-c-s3/archive/refs/tags/v0.2.6.tar.gz",
    ],
)

http_archive(
    name = "aws-c-compression",
    build_file = "//third_party:aws-c-compression.BUILD",
    sha256 = "044b1dbbca431a07bde8255ef9ec443c300fc60d4c9408d4b862f65e496687f4",
    strip_prefix = "aws-c-compression-0.2.16",
    urls = [
        "https://github.com/awslabs/aws-c-compression/archive/refs/tags/v0.2.16.tar.gz",
    ],
)

http_archive(
    name = "aws-checksums",
    build_file = "//third_party:aws-checksums.BUILD",
    sha256 = "84f226f28f9f97077c924fb9f3f59e446791e8826813155cdf9b3702ba2ec0c5",
    strip_prefix = "aws-checksums-0.1.14",
    urls = [
        "https://github.com/awslabs/aws-checksums/archive/refs/tags/v0.1.14.tar.gz",
    ],
)

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
    name = "aws-c-http",
    build_file = "//third_party:aws-c-http.BUILD",
    sha256 = "1240ce036561fae2a9143cb44a6f6cf4b96c84a31d42723a0ff8902f919f46bc",
    strip_prefix = "aws-c-http-0.7.5",
    urls = [
        "https://github.com/awslabs/aws-c-http/archive/refs/tags/v0.7.5.tar.gz",
    ],
)

http_archive(
    name = "aws-c-sdkutils",
    build_file = "//third_party:aws-c-sdkutils.BUILD",
    sha256 = "d4387d3b6a9075b366c706d45bf79881c70a6860a161d9b1441360378342ebd8",
    strip_prefix = "aws-c-sdkutils-0.1.7",
    urls = [
        "https://github.com/awslabs/aws-c-sdkutils/archive/refs/tags/v0.1.7.tar.gz",
    ],
)

http_archive(
    name = "aws-c-mqtt",
    build_file = "//third_party:aws-c-mqtt.BUILD",
    sha256 = "1d4fd1a3e913ce7f9e67db39421ce2003fb4faf7ce87f960ae959ff2eef814eb",
    strip_prefix = "aws-c-mqtt-0.8.7",
    urls = [
        "https://github.com/awslabs/aws-c-mqtt/archive/refs/tags/v0.8.7.tar.gz",
    ],
)

http_archive(
    name = "aws-c-auth",
    build_file = "//third_party:aws-c-auth.BUILD",
    sha256 = "fdbbdfeac085cdb727d464796f230683890d5e35345893f931aaa30690fae87d",
    strip_prefix = "aws-c-auth-0.6.25",
    urls = [
        "https://github.com/awslabs/aws-c-auth/archive/refs/tags/v0.6.25.tar.gz",
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

