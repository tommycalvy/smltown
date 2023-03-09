# Description:
#   AWS C Common

package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # Apache 2.0

exports_files(["LICENSE"])

cc_library(
    name = "aws-c-common",
    srcs = glob([
        "source/*.c",
        # "source/arch/arm/asm/*.c",
        # "source/arch/arm/msvc/*.c",
        # "source/arch/generic/*.c",
        # "source/arch/intel/*.c",
        # "source/arch/intel/asm/*.c",
        # "source/arch/intel/msvc/*.c",
        "source/posix/*.c",
    ]),
    hdrs = [
        "include/aws/common/config.h"
    ] + glob([
        "include/aws/common/*.h",
        "include/aws/common/external/*.h",
        "include/aws/common/private/*.h",
    ]),
    includes = [
        "include",
    ],
    textual_hdrs = glob([
       "include/aws/common/*.inl",
       "include/aws/common/posix/*.inl",
       "include/aws/common/private/*.inl",
    ]),
)

genrule(
    name = "config_h",
    srcs = [
        "include/aws/common/config.h.in",
    ],
    outs = [
        "include/aws/common/config.h",
    ],
    cmd = "sed 's/cmakedefine/undef/g' $< > $@",
)