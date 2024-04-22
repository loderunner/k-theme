import logging
import os
from http import HTTPStatus
from typing import Annotated
from uuid import uuid4

from fastapi import FastAPI, Form, HTTPException, Request, Response, UploadFile
from fastapi.concurrency import asynccontextmanager
from fastapi.exception_handlers import http_exception_handler
from theme import ColorScheme, ColorSpace, generate_theme, read_image

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
    log.error(repr(err), exc_info=err)
    res = await http_exception_handler(req, HTTPException(500))
    log.error(
        f"request ended: {req.method} {req.url.path} - {res.status_code} {HTTPStatus(res.status_code).phrase}"
    )
    return res


@app.post("/theme")
async def get_theme(
    file: UploadFile,
    space: Annotated[ColorSpace, Form()],
    scheme: Annotated[ColorScheme, Form()],
    logger: Logger,
):
    logger.info(
        "reading image file", file=file.filename, file_type=file.content_type
    )
    img = read_image(file.file)

    logger.info(f"generating {space} {scheme} theme")
    theme = generate_theme(img, space, scheme)
    logger.info(f"{space} {scheme} theme generated")

    theme = theme_to_css(theme)

    return theme


color_indexes = [
    "black",
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "white",
    "brightBlack",
    "brightRed",
    "brightGreen",
    "brightYellow",
    "brightBlue",
    "brightMagenta",
    "brightCyan",
    "brightWhite",
]


def rgb_to_css(color):
    return f"rgb({color[0]}, {color[1]}, {color[2]})"


def theme_to_css(theme):
    return {name: rgb_to_css(theme[i]) for i, name in enumerate(color_indexes)}
