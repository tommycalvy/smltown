# Description:
#   AWS C IO

package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # Apache 2.0

exports_files(["LICENSE"])

cc_library(
    name = "aws-c-io",
    srcs = glob([
        "source/*.c",
        "source/*.h",
        "source/bsd/*.c",
        "source/darwin/*.c",
        "source/pkcs11/v2.40/*.h",
        "source/posix/*.c",
        # "source/s2n/*.c",
    ]),
    hdrs = glob([
        "include/aws/io/*.h",
        "include/aws/io/private/*.h",
    ]),
    includes = [
        "include",
    ],
    deps = [
        "@aws-c-common",
        "@aws-c-cal"
    ],
)