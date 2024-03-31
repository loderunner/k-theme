import logging
from enum import Enum
from typing import Annotated

from annotated_types import Ge, Lt
from pydantic_settings import BaseSettings, SettingsConfigDict


class LogLevel(Enum):
    error = "error"
    warning = "warning"
    info = "info"
    debug = "debug"

    def to_logging(self) -> int:
        return logging.getLevelNamesMapping().get(
            self.value.upper(), logging.NOTSET
        )

    @classmethod
    def _missing_(cls, value):
        if not isinstance(value, str):
            return None
        value = value.lower()
        for member in cls:
            if member == value:
                return member
        return None


class Settings(BaseSettings):
    host: str = "0.0.0.0"
    port: Annotated[int, Ge(0), Lt(65536)] = 8000
    log_level: LogLevel = LogLevel.error
    debug: bool = False

    model_config = SettingsConfigDict(env_file=".env")
