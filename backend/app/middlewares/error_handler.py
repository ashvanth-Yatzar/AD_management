import logging
import traceback
from typing import Any

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.core.exceptions import AppException

logger = logging.getLogger(__name__)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
}


def _error_response(
    status_code: int,
    error_code: str,
    message: str,
    details: Any = None,
) -> JSONResponse:
    body: dict[str, Any] = {
        "success": False,
        "error": {
            "code": error_code,
            "message": message,
        },
    }
    if details is not None:
        body["error"]["details"] = details
    return JSONResponse(status_code=status_code, content=body, headers=CORS_HEADERS)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    logger.warning(
        "AppException [%s] %s — path=%s",
        exc.error_code,
        exc.message,
        request.url.path,
    )
    return _error_response(
        status_code=exc.status_code,
        error_code=exc.error_code,
        message=exc.message,
        details=exc.details,
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    details = [
        {
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        }
        for error in exc.errors()
    ]
    logger.warning("Validation error on %s: %s", request.url.path, details)
    return _error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        error_code="VALIDATION_ERROR",
        message="Request validation failed",
        details=details,
    )


async def integrity_error_handler(
    request: Request, exc: IntegrityError
) -> JSONResponse:
    logger.error("Database integrity error on %s: %s", request.url.path, str(exc))
    return _error_response(
        status_code=status.HTTP_409_CONFLICT,
        error_code="CONFLICT",
        message="A database constraint was violated",
    )


async def sqlalchemy_error_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    logger.error("SQLAlchemy error on %s: %s", request.url.path, str(exc))
    return _error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code="DATABASE_ERROR",
        message="A database error occurred",
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(
        "Unhandled exception on %s:\n%s",
        request.url.path,
        traceback.format_exc(),
    )
    return _error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code="INTERNAL_ERROR",
        message="An unexpected error occurred",
    )