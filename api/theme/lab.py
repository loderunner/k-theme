import numpy as np
import skimage as ski

from . import ImageArray


def deltaE(a: ImageArray, b: ImageArray) -> ImageArray:
    """For each pixel in a, return the distance to every pixel in b"""
    return np.apply_along_axis(
        lambda x: np.apply_along_axis(
            lambda y: ski.color.deltaE_ciede2000(x, y), 1, b
        ),
        1,
        a,
    )
