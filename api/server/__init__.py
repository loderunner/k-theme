import logging
import os
from http import HTTPStatus
from typing import TypedDict
from uuid import uuid4

import numpy as np
import skimage as ski
import theme.hsl as hsl
from fastapi import FastAPI, HTTPException, Request, Response, UploadFile
from fastapi.concurrency import asynccontextmanager
from fastapi.exception_handlers import http_exception_handler
from theme import ConvertFunc, DistFunc, euclidean, generate_theme, read_image

from .logger import Logger, configure_logger, get_logger, get_req_logger
from .settings import load_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = load_settings(os.environ.get("FASTAPI_ENV"))
    configure_logger(settings)
    loggers = ["uvicorn", "uvicorn.error", "uvicorn.access"]
    for l in loggers:
        logging.getLogger(l).propagate = False
    get_logger().info("application started")
    yield
    get_logger().info("application stopped")
    for l in loggers:
        logging.getLogger(l).propagate = True


app = FastAPI(lifespan=lifespan)


@app.middleware("http")
async def access_log(req: Request, next_call):
    log = get_req_logger(req)
    log.info(f"request started: {req.method} {req.url.path}")
    res: Response = await next_call(req)
    log.info(
        f"request ended: {req.method} {req.url.path} - {res.status_code} {HTTPStatus(res.status_code).phrase}"
    )
    return res


@app.middleware("http")
async def req_id(req: Request, next_call):
    req.state.id = str(uuid4())
    return await next_call(req)


@app.exception_handler(Exception)
async def exception_handler(req: Request, err: Exception):
    log = get_req_logger(req)
    res = await http_exception_handler(req, HTTPException(500))
    log.error(
        f"request ended: {req.method} {req.url.path} - {res.status_code} {HTTPStatus(res.status_code).phrase}"
    )
    return res


class ColorSpaceOperator(TypedDict):
    to_space: ConvertFunc
    from_space: ConvertFunc
    dist_func: DistFunc


ops: dict[str, ColorSpaceOperator] = {
    "HSL": ColorSpaceOperator(
        to_space=hsl.rgb_to_xyz, from_space=hsl.xyz_to_rgb, dist_func=euclidean
    ),
    "RGB": ColorSpaceOperator(
        to_space=np.copy, from_space=np.copy, dist_func=euclidean
    ),
    "CIE Lab": ColorSpaceOperator(
        to_space=ski.color.rgb2lab,
        from_space=ski.color.lab2rgb,
        dist_func=euclidean,
    ),
    "YUV": ColorSpaceOperator(
        to_space=ski.color.rgb2yuv,
        from_space=ski.color.yuv2rgb,
        dist_func=euclidean,
    ),
}


@app.post("/theme")
async def get_theme(
    file: UploadFile,
    logger: Logger,
):
    logger.info(
        "reading image file", file=file.filename, file_type=file.content_type
    )
    img = read_image(file.file)

    themes = {}
    for space, op in ops.items():
        schemes = {}
        for scheme in ["light", "dark"]:
            logger.info(f"generating {space} {scheme} theme")
            theme = generate_theme(img, scheme, **op)
            logger.info(f"{space} {scheme} theme generated")

            schemes[scheme] = theme_to_css(theme)

        themes[space] = schemes

    return themes


def rgb_to_css(color):
    return f"rgb({color[0]}, {color[1]}, {color[2]})"


def theme_to_css(theme):
    return {
        "black": rgb_to_css(theme[0]),
        "red": rgb_to_css(theme[1]),
        "green": rgb_to_css(theme[2]),
        "yellow": rgb_to_css(theme[3]),
        "blue": rgb_to_css(theme[4]),
        "magenta": rgb_to_css(theme[5]),
        "cyan": rgb_to_css(theme[6]),
        "white": rgb_to_css(theme[7]),
        "brightBlack": rgb_to_css(theme[8]),
        "brightRed": rgb_to_css(theme[9]),
        "brightGreen": rgb_to_css(theme[10]),
        "brightYellow": rgb_to_css(theme[11]),
        "brightBlue": rgb_to_css(theme[12]),
        "brightMagenta": rgb_to_css(theme[13]),
        "brightCyan": rgb_to_css(theme[14]),
        "brightWhite": rgb_to_css(theme[15]),
    }
