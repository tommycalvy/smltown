# Description:
#   AWS C S3

package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # Apache 2.0

exports_files(["LICENSE"])

cc_library(
    name = "aws-c-s3",
    srcs = glob([
        "source/*.c",
    ]),
    hdrs = glob([
        "include/aws/s3/*.h",
        "include/aws/s3/private/*.h",
    ]),
    includes = [
        "include",
    ],
    deps = [
        "@aws-checksums",
        "@aws-c-http",
        "@aws-c-auth",
    ],
)