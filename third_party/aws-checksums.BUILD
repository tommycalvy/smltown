# Description:
#   AWS C CHECKSUMS

package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # Apache 2.0

exports_files(["LICENSE"])

cc_library(
    name = "aws-checksums",
    srcs = glob([
        "source/*.c",
        "source/arm/*.c",
        "source/generic/*.c",
    ]),
    hdrs = glob([
        "include/aws/checksums/*.h",
        "include/aws/checksums/private/*.h",
    ]),
    includes = [
        "include",
    ],
    deps = [
        "@aws-c-common",
    ],
)