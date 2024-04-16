from typing import BinaryIO, Callable, Literal

import numpy as np
import numpy.typing as npt
import skimage as ski

ImageArray = npt.NDArray[np.float64]
ConvertFunc = Callable[[ImageArray], ImageArray]
DistArray = npt.NDArray[np.float64]
DistFunc = Callable[[ImageArray, ImageArray], DistArray]
AssignArray = npt.NDArray[np.int_]


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


def euclidean(a: ImageArray, b: ImageArray) -> ImageArray:
    """For each pixel in a, return the distance to every pixel in b"""
    return np.apply_along_axis(lambda x: np.linalg.norm(x - b, axis=1), 1, a)


def snap_centroids(
    centroids: ImageArray, px: ImageArray, dist_func: DistFunc
) -> ImageArray:
    """Returns new centroids snapped to the closest pixel value (Euclidean distance)"""
    distances = dist_func(centroids, px)
    return px[np.argmin(distances, axis=1)]


def assign_centroids(
    centroids: ImageArray, px: ImageArray, dist_func: DistFunc
) -> AssignArray:
    """For each pixel in px, compute the closest centroid and return the list of assigned centroids"""
    distances = dist_func(px, centroids)
    assigned = np.argmin(distances, axis=1)
    return assigned


def compute_means(centroids: ImageArray, assigned: AssignArray, px: ImageArray):
    """For each group assigned to a centroid, compute the mean and return the list of means"""
    return np.array(
        [
            px[assigned == k].mean(axis=0) if k in assigned else centroids[k]
            for k in range(len(centroids))
        ]
    )


def generate_theme(
    img: ImageArray,
    scheme: str,
    to_space: ConvertFunc,
    from_space: ConvertFunc,
    dist_func: DistFunc,
    max_iterations=1,
):
    """Generate a theme from an image"""
    px = to_space(img)
    theme = to_space(light_centroids if scheme == "light" else dark_centroids)
    theme = snap_centroids(theme, px, dist_func)
    for i in range(max_iterations):
        assigned = assign_centroids(theme, px, dist_func)
        means = compute_means(theme, assigned, px)
        snapped_means = snap_centroids(means, px, dist_func)
        if np.allclose(theme, snapped_means):
            break
        theme = snapped_means
    return np.floor(from_space(theme) * 255).astype(int)
