# Description:
#   AWS C MQTT

package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # Apache 2.0

exports_files(["LICENSE"])

cc_library(
    name = "aws-c-mqtt",
    srcs = glob([
        "source/*.c",
        "source/v5/*.c",
    ]),
    hdrs = glob([
        "include/aws/mqtt/*.h",
        "include/aws/mqtt/private/*.h",
        "include/aws/mqtt/private/v5/*.h",
        "include/aws/mqtt/v5/*.h",
    ]),
    includes = [
        "include",
    ],
    deps = [
        "@aws-c-common",
        "@aws-c-http",
        "@aws-c-io",
    ],
)