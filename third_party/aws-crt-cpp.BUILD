# Description:
#   AWS C++ CRT

package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # Apache 2.0

exports_files(["LICENSE"])

cc_library(
    name = "aws-crt-cpp",
    srcs = glob([
        "source/*.cpp",
        "source/auth/*.cpp",
        "source/crypto/*.cpp",
        "source/endpoints/*.cpp",
        "source/http/*.cpp",
        "source/io/*.cpp",
        "source/iot/*.cpp",
        "source/mqtt/*.cpp",
    ]),
    hdrs = glob([
        "include/aws/crt/*.h",
        "include/aws/crt/auth/*.h",
        "include/aws/crt/crypto/*.h",
        "include/aws/crt/endpoints/*.h",
        "include/aws/crt/http/*.h",
        "include/aws/crt/io/*.h",
        "include/aws/crt/mqtt/*.h",
        "include/aws/iot/*.h",
    ]),
    includes = [
        "include",
    ],
    deps = [
        "@aws-c-io",
        "@aws-c-common"
    ],
)