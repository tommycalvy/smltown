# Please Run:
# bazel run //:gazelle
# bazel run @hedron_compile_commands//:refresh_all

# Bazel bootstrapping

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive", "http_file")

# Hedron's Compile Commands Extractor for Bazel
# https://github.com/hedronvision/bazel-compile-commands-extractor
# bazel run @hedron_compile_commands//:refresh_all
http_archive(
    name = "hedron_compile_commands",

    # Replace the commit hash in both places (below) with the latest, rather than using the stale one here.
    # Even better, set up Renovate and let it do the work for you (see "Suggestion: Updates" in the README).
    sha256 = "10b5f7a36252ce0dd3396c289ba0138779adb6436c187266f6a93de505f3434f",
    strip_prefix = "bazel-compile-commands-extractor-07c307ab34d458cf0a4187a15ce1f6a2b72c408c",
    url = "https://github.com/hedronvision/bazel-compile-commands-extractor/archive/07c307ab34d458cf0a4187a15ce1f6a2b72c408c.tar.gz",
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

http_archive(
    name = "io_bazel_rules_go",
    sha256 = "56d8c5a5c91e1af73eca71a6fab2ced959b67c86d12ba37feedb0a2dfea441a6",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_go/releases/download/v0.37.0/rules_go-v0.37.0.zip",
        "https://github.com/bazelbuild/rules_go/releases/download/v0.37.0/rules_go-v0.37.0.zip",
    ],
)

http_archive(
    name = "bazel_gazelle",
    sha256 = "ecba0f04f96b4960a5b250c8e8eeec42281035970aa8852dda73098274d14a1d",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-gazelle/releases/download/v0.29.0/bazel-gazelle-v0.29.0.tar.gz",
        "https://github.com/bazelbuild/bazel-gazelle/releases/download/v0.29.0/bazel-gazelle-v0.29.0.tar.gz",
    ],
)

# CPP GRPC Rules

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

# Golang GRPC Rules
# bazel run //:gazelle

load("@rules_proto_grpc//:repositories.bzl", "bazel_gazelle", "io_bazel_rules_go")  # buildifier: disable=same-origin-load

io_bazel_rules_go()

bazel_gazelle()

load("@rules_proto_grpc//go:repositories.bzl", rules_proto_grpc_go_repos = "go_repos")

rules_proto_grpc_go_repos()

load("@io_bazel_rules_go//go:deps.bzl", "go_download_sdk", "go_register_toolchains", "go_rules_dependencies")

go_download_sdk(
    name = "go_sdk",
    goos = "linux",
    goarch = "arm64",
    version = "1.20.3",
    sdks = {
        # NOTE: In most cases the whole sdks attribute is not needed.
        # There are 2 "common" reasons you might want it:
        #
        # 1. You need to use an modified GO SDK, or an unsupported version
        #    (for example, a beta or release candidate)
        #
        # 2. You want to avoid the dependency on the index file for the
        #    SHA-256 checksums. In this case, You can get the expected
        #    filenames and checksums from https://go.dev/dl/
        "linux_arm64": ("go1.20.3.linux-arm64.tar.gz", "86b0ed0f2b2df50fa8036eea875d1cf2d76cefdacf247c44639a1464b7e36b95"),
        "darwin_arm64": ("go1.20.3.darwin-arm64.tar.gz", "eb186529f13f901e7a2c4438a05c2cd90d74706aaa0a888469b2a4a617b6ee54"),
    },
)

go_rules_dependencies()

go_register_toolchains()

load("@bazel_gazelle//:deps.bzl", "gazelle_dependencies", "go_repository")
load("//:deps.bzl", "go_dependencies")

# gazelle:repository_macro deps.bzl%go_dependencies
go_dependencies()

gazelle_dependencies()

# Golang Repositories

go_repository(
    name = "com_github_go_kit_kit",
    build_file_proto_mode = "disable_global",
    importpath = "github.com/go-kit/kit",  # Import path used in the .go files
    sum = "h1:e4o3o3IsBfAKQh5Qbbiqyfu97Ku7jrO/JbohvztANh4=",
    version = "v0.12.0",
)

go_repository(
    name = "com_github_go_kit_log",
    build_file_proto_mode = "disable_global",
    importpath = "github.com/go-kit/log",  # Import path used in the .go files
    sum = "h1:7i2K3eKTos3Vc0enKCfnVcgHh2olr/MyfboYq7cAcFw=",
    version = "v0.2.0",
)

go_repository(
    name = "com_github_aws_aws_sdk_go_v2_feature_dynamodb_attributevalue",
    build_file_proto_mode = "disable_global",
    importpath = "github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue",
    sum = "h1:bKbdstt7+PzIRSIXZ11Yo8Qh8t0AHn6jEYUfsbVcLjE=",
    version = "v1.10.0",
)

go_repository(
    name = "com_github_gorilla_mux",
    build_file_proto_mode = "disable_global",
    importpath = "github.com/gorilla/mux",
    sum = "h1:i40aqfkR1h2SlN9hojwV5ZA91wcXFOvkdNIeFDP5koI=",
    version = "v1.8.0",
)

http_archive(
    name = "phtree",
    patch_cmds = [
        """sed -i.bak 's/std::uint64_t/size_t/g' include/phtree/common/b_plus_tree_map.h""",
    ],
    sha256 = "c2dcc5aa9f99a69172dc3ab0eb5e82a42f95e9bf713d06a6f10a8a740fe0ffa1",
    strip_prefix = "phtree-cpp-1.6.0",
    url = "https://github.com/tzaeschke/phtree-cpp/archive/refs/tags/v1.6.0.tar.gz",
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
    name = "curl",
    build_file = "//third_party:curl.BUILD",
    sha256 = "d9aefeb87998472cd79418edd4fb4dc68c1859afdbcbc2e02400b220adc64ec1",
    strip_prefix = "curl-curl-8_0_1",
    urls = [
        "https://github.com/curl/curl/archive/refs/tags/curl-8_0_1.tar.gz",
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

# Rules Docker

http_archive(
    name = "io_bazel_rules_docker",
    sha256 = "b1e80761a8a8243d03ebca8845e9cc1ba6c82ce7c5179ce2b295cd36f7e394bf",
    urls = ["https://github.com/bazelbuild/rules_docker/releases/download/v0.25.0/rules_docker-v0.25.0.tar.gz"],
)

load(
    "@io_bazel_rules_docker//repositories:repositories.bzl",
    container_repositories = "repositories",
)
container_repositories()

load("@io_bazel_rules_docker//repositories:deps.bzl", container_deps = "deps")

container_deps()

load(
    "@io_bazel_rules_docker//cc:image.bzl",
    _cc_image_repos = "repositories",
)

_cc_image_repos()

load("@io_bazel_rules_docker//container:container.bzl", "container_pull")

container_pull(
    name = "amazonlinux",
    architecture = "arm64",
    os = "linux",
    registry = "index.docker.io",
    repository = "library/amazonlinux",
    # tag = "2023.0.20230322.0",
    digest = "sha256:11ed3e57e4bf082e5438b7a443401b7621abca75b05245c1e5b04a55c7d2eb9d",
)

# Bazel Zig CC

BAZEL_ZIG_CC_VERSION = "v1.0.1"

http_archive(
    name = "bazel-zig-cc",
    sha256 = "e9f82bfb74b3df5ca0e67f4d4989e7f1f7ce3386c295fd7fda881ab91f83e509",
    strip_prefix = "bazel-zig-cc-{}".format(BAZEL_ZIG_CC_VERSION),
    urls = [
        "https://mirror.bazel.build/github.com/uber/bazel-zig-cc/releases/download/{0}/{0}.tar.gz".format(BAZEL_ZIG_CC_VERSION),
        "https://github.com/uber/bazel-zig-cc/releases/download/{0}/{0}.tar.gz".format(BAZEL_ZIG_CC_VERSION),
    ],
)

load("@bazel-zig-cc//toolchain:defs.bzl", zig_toolchains = "toolchains")

# version, url_formats and host_platform_sha256 are optional for those who
# want to control their Zig SDK version.
zig_toolchains()