# Description:
#   AWS C SDKUTILS

package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # Apache 2.0

exports_files(["LICENSE"])

cc_library(
    name = "aws-c-sdkutils",
    srcs = glob([
        "source/*.c",
    ]),
    hdrs = glob([
        "include/aws/sdkutils/*.h",
        "include/aws/sdkutils/private/*.h",
    ]),
    includes = [
        "include",
    ],
    deps = [
        "@aws-c-common",
    ],
)