from dataclasses import dataclass
from typing import BinaryIO, Literal, TypedDict

import numpy as np
import skimage as ski

from . import hsl, k_means
from .k_means import ConvertFunc, DistFunc, ImageArray


def read_image(file: str | BinaryIO) -> ImageArray:
    img = ski.io.imread(file)
    img = ski.transform.resize(img, (256, 256), anti_aliasing=False)
    if img.shape[-1] == 1:
        img = ski.color.gray2rgb(img)
    elif img.shape[-1] == 4:
        img = ski.color.rgba2rgb(img)
    return ski.util.img_as_float64(img).reshape((65536, -1))


# base light palette centroids in RGB space
light_centroids: ImageArray = np.array(
    [
        [0.0, 0.0, 0.0],
        [1.0, 0.5, 0.5],
        [0.5, 1.0, 0.5],
        [1.0, 1.0, 0.5],
        [0.5, 0.5, 1.0],
        [1.0, 0.5, 1.0],
        [0.5, 1.0, 1.0],
        [0.5, 0.5, 0.5],
        [1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0],
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [1.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
        [1.0, 0.0, 1.0],
        [0.0, 1.0, 1.0],
        [1.0, 1.0, 1.0],
    ]
)

# base dark palette centroids in HSL
dark_centroids: ImageArray = np.array(
    [
        [0.0, 0.0, 0.0],
        [2.0 / 3.0, 0.0, 0.0],
        [0.0, 2.0 / 3.0, 0.0],
        [2.0 / 3.0, 2.0 / 3.0, 0.0],
        [0.0, 0.0, 2.0 / 3.0],
        [2.0 / 3.0, 0.0, 2.0 / 3.0],
        [0.0, 2.0 / 3.0, 2.0 / 3.0],
        [0.5, 0.5, 0.5],
        [1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0],
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [1.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
        [1.0, 0.0, 1.0],
        [0.0, 1.0, 1.0],
        [1.0, 1.0, 1.0],
    ]
)


type ColorScheme = Literal["light", "dark"]
type ColorSpace = Literal["HSL", "RGB", "CIE Lab", "YUV"]


@dataclass
class ColorSpaceOperator:
    to_space: ConvertFunc
    from_space: ConvertFunc
    dist_func: DistFunc


ops: dict[ColorSpace, ColorSpaceOperator] = {
    "HSL": ColorSpaceOperator(
        to_space=hsl.rgb_to_xyz,
        from_space=hsl.xyz_to_rgb,
        dist_func=k_means.euclidean,
    ),
    "RGB": ColorSpaceOperator(
        to_space=np.copy, from_space=np.copy, dist_func=k_means.euclidean
    ),
    "CIE Lab": ColorSpaceOperator(
        to_space=ski.color.rgb2lab,
        from_space=ski.color.lab2rgb,
        dist_func=k_means.euclidean,
    ),
    "YUV": ColorSpaceOperator(
        to_space=ski.color.rgb2yuv,
        from_space=ski.color.yuv2rgb,
        dist_func=k_means.euclidean,
    ),
}


def generate_theme(
    img: ImageArray,
    space: ColorSpace,
    scheme: ColorScheme,
    max_iterations=1,
):
    """Generate a theme from an image"""
    op = ops[space]
    px = op.to_space(img)
    theme = op.to_space(light_centroids)
    theme = k_means.snap_centroids(theme, px, op.dist_func)
    for i in range(max_iterations):
        assigned = k_means.assign_centroids(theme, px, op.dist_func)
        means = k_means.compute_means(theme, assigned, px)
        snapped_means = k_means.snap_centroids(means, px, op.dist_func)
        if np.allclose(theme, snapped_means):
            break
        theme = snapped_means
    return np.floor(op.from_space(theme) * 255).astype(int)
