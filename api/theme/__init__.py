from io import BytesIO

import numpy as np
import skimage as ski


def read_image(path_or_file: str | BytesIO):
    img = ski.io.imread(path_or_file)
    img = ski.transform.resize(img, (256, 256), anti_aliasing=False)
    if img.shape[-1] == 1:
        img = ski.color.gray2rgb(img)
    elif img.shape[-1] == 4:
        img = ski.color.rgba2rgb(img)
    return ski.util.img_as_float(img).reshape((65536, -1))


def hsv_to_hsl(hsv):
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


def rgb_to_hsl(rgb):
    """Converts pixels in RGB to HSL"""
    hsv = ski.color.rgb2hsv(rgb)
    return hsv_to_hsl(hsv)


def hsl_to_hsv(hsl):
    """Converts pixels in HSL to HSV"""
    h, sl, l = np.rollaxis(hsl, 1)
    v = l + sl * np.min((l, 1 - l), axis=0)
    mask = v != 0
    s = np.where(mask, 2 * (1 - np.divide(l, v, where=mask)), 0)
    return np.stack((h, s, v), axis=1)


def hsl_to_rgb(hsl):
    """Converts pixels in HSL to RGB"""
    hsv = hsl_to_hsv(hsl)
    return ski.color.hsv2rgb(hsv)


def hsl_to_xyz(hsl):
    """Converts pixels in HSL to XYZ"""
    h, s, l = np.rollaxis(hsl, 1)
    r = s * (1 - 2 * np.abs(l - 0.5))
    x = r * np.cos(2 * np.pi * h)
    y = r * np.sin(2 * np.pi * h)
    z = l
    return np.stack((x, y, z), axis=1)


def xyz_to_hsl(xyz):
    """Converts pixels in XYZ to HSL"""
    x, y, z = np.rollaxis(xyz, 1)
    h = np.fmod(np.arctan2(y, x) + 2 * np.pi, 2 * np.pi) / (2 * np.pi)
    r = np.sqrt(x**2 + y**2)
    l = z
    mask = r != 0
    s = np.where(mask, np.divide(r, 1 - 2 * np.abs(l - 0.5), where=mask), 0)
    return np.stack((h, s, l), axis=1)


def rgb_to_xyz(rgb):
    """Converts pixels in RGB to XYZ"""
    hsl = rgb_to_hsl(rgb)
    return hsl_to_xyz(hsl)


def xyz_to_rgb(xyz):
    """Converts pixels in XYZ to RGB"""
    hsl = xyz_to_hsl(xyz)
    return hsl_to_rgb(hsl)


def rgb_to_css(color):
    return f"rgb({color[0]}, {color[1]}, {color[2]})"


# base palette centroids in RGB
base_centroids = np.array(
    [
        [0, 0, 0],
        [0.5, 0, 0],
        [0, 0.5, 0],
        [0.5, 0.5, 0],
        [0, 0, 0.5],
        [0.5, 0, 0.5],
        [0, 0.5, 0.5],
        [0.5, 0.5, 0.5],
        [0.33, 0.33, 0.33],
        [1.0, 0, 0],
        [0, 1.0, 0],
        [1.0, 1.0, 0],
        [0, 0, 1.0],
        [1.0, 0, 1.0],
        [0, 1.0, 1.0],
        [1.0, 1.0, 1.0],
    ]
)


def init_centroids():
    """Returns a copy of base centroids in HSL-XYZ"""
    return rgb_to_xyz(base_centroids)


def snap_centroids(centroids, px):
    """Returns new centroids snapped to the closest pixel value (Euclidean distance)"""
    distances = np.apply_along_axis(
        lambda c: np.linalg.norm(c - px, axis=1), 1, centroids
    )
    return px[np.argmin(distances, axis=1)]


def assign_centroids(centroids, px):
    """For each pixel in px, compute the closest centroid and return the list of assigned centroids"""
    distances = np.apply_along_axis(
        lambda p: np.linalg.norm(p - centroids, axis=1), 1, px
    )
    assigned = np.argmin(distances, axis=1)
    return assigned


def compute_means(centroids, assigned, px):
    """For each group assigned to a centroid, compute the mean and return the list of means"""
    return np.array(
        [
            px[assigned == k].mean(axis=0) if k in assigned else centroids[k]
            for k in range(len(centroids))
        ]
    )


def generate_theme(img, max_iterations=10):
    """Generate a theme from an image"""
    px = rgb_to_xyz(img)
    theme = init_centroids()
    theme = snap_centroids(theme, px)
    for i in range(max_iterations):
        assigned = assign_centroids(theme, px)
        means = compute_means(theme, assigned, px)
        snapped_means = snap_centroids(means, px)
        if np.allclose(theme, snapped_means):
            break
        theme = snapped_means
    return np.floor(xyz_to_rgb(theme) * 255).astype(int)
