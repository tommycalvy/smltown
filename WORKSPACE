# Bazel bootstrapping

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive", "http_file")

# Development environment tooling

BUILDIFIER_VERSION = "0.29.0"

http_file(
    name = "buildifier_linux",
    executable = True,
    sha256 = "4c985c883eafdde9c0e8cf3c8595b8bfdf32e77571c369bf8ddae83b042028d6",
    urls = ["https://github.com/bazelbuild/buildtools/releases/download/{version}/buildifier".format(version = BUILDIFIER_VERSION)],
)

http_file(
    name = "buildifier_macos",
    executable = True,
    sha256 = "9b108decaa9a624fbac65285e529994088c5d15fecc1a30866afc03a48619245",
    urls = ["https://github.com/bazelbuild/buildtools/releases/download/{version}/buildifier.mac".format(version = BUILDIFIER_VERSION)],
)

http_file(
    name = "buildifier_windows",
    executable = True,
    sha256 = "dc5d6ed5e3e0dbe9955f7606939c627af5a2be7f9bdd8814e77a22109164394f",
    urls = ["https://github.com/bazelbuild/buildtools/releases/download/{version}/buildifier.exe".format(version = BUILDIFIER_VERSION)],
)

http_archive(
    name = "bazel_compilation_database",
    sha256 = "bb1b812396e2ee36a50a13b03ae6833173ce643e8a4bd50731067d0b4e5c6e86",
    strip_prefix = "bazel-compilation-database-0.3.5",
    url = "https://github.com/grailbio/bazel-compilation-database/archive/0.3.5.tar.gz",
)

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
