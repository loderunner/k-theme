import logging
import os
from http import HTTPStatus
from io import BytesIO
from typing import Annotated
from uuid import uuid4

import requests
from fastapi import FastAPI, File, HTTPException, Request, Response
from fastapi.concurrency import asynccontextmanager
from fastapi.exception_handlers import http_exception_handler
from pydantic import StringConstraints
from theme import generate_theme, read_image, rgb_to_css

from .logger import Logger, get_req_logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    loggers = ["uvicorn", "uvicorn.error", "uvicorn.access"]
    for l in loggers:
        logging.getLogger(l).propagate = False
    yield
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
    file: Annotated[bytes, File()],
    logger: Logger,
):
    with BytesIO(file) as b:
        img = read_image(b)

    logger.info("generating theme")
    theme = generate_theme(img, max_iterations=1)

    logger.info("theme generated")
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
