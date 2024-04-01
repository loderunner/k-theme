import logging
import sys
from typing import Annotated, Any

import structlog
from fastapi import Depends, Request
from structlog.contextvars import merge_contextvars
from structlog.dev import ConsoleRenderer, set_exc_info
from structlog.processors import (
    CallsiteParameter,
    CallsiteParameterAdder,
    EventRenamer,
    JSONRenderer,
    StackInfoRenderer,
    TimeStamper,
    add_log_level,
    dict_tracebacks,
)
from structlog.stdlib import ProcessorFormatter

from .settings import Settings


def filter_private_ctx(_, __, event_dict: dict[str, Any]):
    for k in list(event_dict.keys()):
        if k.startswith("_"):
            event_dict.pop(k)


def make_processors():
    processors = [
        merge_contextvars,
        add_log_level,
        CallsiteParameterAdder(
            [
                CallsiteParameter.FUNC_NAME,
                CallsiteParameter.FILENAME,
                CallsiteParameter.LINENO,
            ]
        ),
        StackInfoRenderer(),
        set_exc_info,
        TimeStamper("iso"),
    ]
    if sys.stdout.isatty():
        processors += [ConsoleRenderer()]
    else:
        processors += [
            dict_tracebacks,
            EventRenamer("message"),
            JSONRenderer(),
        ]
    return processors


def configure_logger(settings: Settings):
    structlog.configure(
        processors=make_processors(),
        wrapper_class=structlog.make_filtering_bound_logger(
            settings.log_level.to_logging()
        ),
        cache_logger_on_first_use=True,
    )


def stdlib_formatter():
    return ProcessorFormatter(processors=make_processors())


def get_logger():
    return structlog.get_logger()


def get_req_logger(req: Request):
    if req is None:
        return structlog.get_logger()
    logger: structlog.stdlib.BoundLogger = structlog.get_logger(
        path=req.url.path,
        method=req.method,
        request_id=req.state.id,
        **req.path_params,
        **req.query_params,
    )
    if req.headers.get("User-Agent") is not None:
        logger = logger.bind(user_agent=req.headers.get("User-Agent"))
    return logger


Logger = Annotated[structlog.stdlib.BoundLogger, Depends(get_logger)]
