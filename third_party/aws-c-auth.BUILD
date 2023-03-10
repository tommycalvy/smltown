# Description:
#   AWS C AUTH

package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # Apache 2.0

exports_files(["LICENSE"])

cc_library(
    name = "aws-c-auth",
    srcs = glob([
        "source/*.c",
    ]),
    hdrs = glob([
        "include/aws/auth/*.h",
        "include/aws/auth/private/*.h",
    ]),
    includes = [
        "include",
    ],
    deps = [
        "@aws-c-io",
        "@aws-c-sdkutils",
        "@aws-c-http",
    ],
)