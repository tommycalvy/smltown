# Description:
#   AWS C COMPRESSION

package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # Apache 2.0

exports_files(["LICENSE"])

cc_library(
    name = "aws-c-compression",
    srcs = glob([
        "source/*.c",
        "source/huffman_generator/*.c"
    ]),
    hdrs = glob([
        "include/aws/compression/*.h",
        "include/aws/compression/private/*.h",
    ]),
    includes = [
        "include",
    ],
    deps = [
        "@aws-c-common",
    ],
)