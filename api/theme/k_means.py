from typing import Callable

import numpy as np
import numpy.typing as npt

ImageArray = npt.NDArray[np.float64]
ConvertFunc = Callable[[ImageArray], ImageArray]
DistArray = npt.NDArray[np.float64]
DistFunc = Callable[[ImageArray, ImageArray], DistArray]
AssignArray = npt.NDArray[np.int_]


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
