import numpy as np
import skimage as ski

from . import ImageArray


def hsv_to_hsl(hsv: ImageArray) -> ImageArray:
    """Converts pixels in HSV to HSL"""
    h, sv, v = np.rollaxis(hsv, 1)
    l = v * (1 - 0.5 * sv)
    mask = (l != 0) & (l != 1)
    sl = np.where(
        mask,
        np.divide((v - l), np.min((l, 1 - l), axis=0), where=mask),
        0,
    )
    return np.stack((h, sl, l), axis=1)


def rgb_to_hsl(rgb: ImageArray) -> ImageArray:
    """Converts pixels in RGB to HSL"""
    hsv = ski.color.rgb2hsv(rgb)
    return hsv_to_hsl(hsv)


def hsl_to_hsv(hsl: ImageArray) -> ImageArray:
    """Converts pixels in HSL to HSV"""
    h, sl, l = np.rollaxis(hsl, 1)
    v = l + sl * np.min((l, 1 - l), axis=0)
    mask = v != 0
    s = np.where(mask, 2 * (1 - np.divide(l, v, where=mask)), 0)
    return np.stack((h, s, v), axis=1)


def hsl_to_rgb(hsl: ImageArray) -> ImageArray:
    """Converts pixels in HSL to RGB"""
    hsv = hsl_to_hsv(hsl)
    return ski.color.hsv2rgb(hsv)


def hsl_to_xyz(hsl: ImageArray) -> ImageArray:
    """Converts pixels in HSL to XYZ"""
    h, s, l = np.rollaxis(hsl, 1)
    r = s * (1 - 2 * np.abs(l - 0.5))
    x = r * np.cos(2 * np.pi * h)
    y = r * np.sin(2 * np.pi * h)
    z = l
    return np.stack((x, y, z), axis=1)


def xyz_to_hsl(xyz: ImageArray) -> ImageArray:
    """Converts pixels in XYZ to HSL"""
    x, y, z = np.rollaxis(xyz, 1)
    h = np.fmod(np.arctan2(y, x) + 2 * np.pi, 2 * np.pi) / (2 * np.pi)
    r = np.sqrt(x**2 + y**2)
    l = z
    mask = r != 0
    s = np.where(mask, np.divide(r, 1 - 2 * np.abs(l - 0.5), where=mask), 0)
    return np.stack((h, s, l), axis=1)


def rgb_to_xyz(rgb: ImageArray) -> ImageArray:
    """Converts pixels in RGB to XYZ"""
    hsl = rgb_to_hsl(rgb)
    return hsl_to_xyz(hsl)


def xyz_to_rgb(xyz: ImageArray) -> ImageArray:
    """Converts pixels in XYZ to RGB"""
    hsl = xyz_to_hsl(xyz)
    return hsl_to_rgb(hsl)
