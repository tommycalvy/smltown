# Description:
#   Curl

package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # Apache 2.0

exports_files(["LICENSE"])

cc_library(
    name = "curl",
    srcs = glob([
        "source/*.c",
        "source/*.h",
    ]),
    hdrs = glob([
        "include/curl/*.h",
    ]),
    defines = [
        "BYO_CRYPTO=1",
    ],
    includes = [
        "include",
    ],
    deps = [
        "@boringssl//:crypto",
    ],
)