import logging
import os
from http import HTTPStatus
from io import BytesIO
from typing import Annotated
from uuid import uuid4

import requests
import theme.hsl as hsl
from fastapi import FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.concurrency import asynccontextmanager
from fastapi.exception_handlers import http_exception_handler
from pydantic import StringConstraints
from theme import euclidean, generate_theme, read_image

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


@app.post("/theme")
async def get_theme(
    file: UploadFile,
    logger: Logger,
):
    logger.info(
        "reading image file", file=file.filename, file_type=file.content_type
    )
    img = read_image(file.file)

    logger.info("generating light theme")
    light_theme = generate_theme(
        img,
        "light",
        to_space=hsl.rgb_to_xyz,
        from_space=hsl.xyz_to_rgb,
        dist_func=euclidean,
    )
    logger.info("light theme generated")

    logger.info("generating dark theme")
    dark_theme = generate_theme(
        img,
        "dark",
        to_space=hsl.rgb_to_xyz,
        from_space=hsl.xyz_to_rgb,
        dist_func=euclidean,
    )
    logger.info("dark theme generated")

    return {
        "light": theme_to_css(light_theme),
        "dark": theme_to_css(dark_theme),
    }


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
