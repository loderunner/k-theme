import sys
from typing import Annotated

import structlog
from fastapi import Depends, Request
from structlog.contextvars import merge_contextvars
from structlog.dev import ConsoleRenderer, set_exc_info
from structlog.processors import (
    EventRenamer,
    JSONRenderer,
    StackInfoRenderer,
    TimeStamper,
    add_log_level,
)

from .settings import Settings


def configure_logger(settings: Settings):
    processors = [
        merge_contextvars,
        StackInfoRenderer(),
        set_exc_info,
        add_log_level,
        TimeStamper("iso"),
    ]
    if sys.stdout.isatty():
        processors += [ConsoleRenderer()]
    else:
        processors += [EventRenamer("message"), JSONRenderer()]
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(
            settings.log_level.to_logging()
        ),
        cache_logger_on_first_use=True,
    )


def get_logger(req: Request):
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
