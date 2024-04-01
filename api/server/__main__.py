import logging
import os

import uvicorn
import uvicorn.config

from .logger import configure_logger
from .settings import Settings

env = os.environ.get("FASTAPI_ENV")
if env == "development" or env == "production":
    env_file = f".env.{env}"
else:
    env_file = ".env"

settings = Settings(_env_file=env_file)
configure_logger(settings)

uvicorn.run(
    "server:app",
    reload=settings.debug,
    host=settings.host,
    port=settings.port,
    log_config={
        "version": 1,
        "formatters": {"structlog": {"()": "server.logger.stdlib_formatter"}},
        "handlers": {
            "null": {
                "class": "logging.NullHandler",
            },
            "structlog": {
                "class": "logging.StreamHandler",
                "formatter": "structlog",
            },
        },
        "loggers": {
            "uvicorn": {
                "handlers": ["structlog"],
                "level": settings.log_level.to_logging(),
            },
            "uvicorn.error": {
                "handlers": ["null"],
            },
            "uvicorn.access": {
                "handlers": ["null"],
            },
        },
    },
)
