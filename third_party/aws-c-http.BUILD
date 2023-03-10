# Description:
#   AWS C HTTP

package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # Apache 2.0

exports_files(["LICENSE"])

cc_library(
    name = "aws-c-http",
    srcs = glob([
        "source/*.c",
    ]),
    hdrs = glob([
        "include/aws/http/*.h",
        "include/aws/http/private/*.h",
        "include/aws/http/private/*.def"
    ]),
    includes = [
        "include",
    ],
    deps = [
        "@aws-c-common",
        "@aws-c-io",
        "@aws-c-compression",
    ],
)