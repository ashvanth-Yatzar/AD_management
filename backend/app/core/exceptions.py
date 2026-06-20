from typing import Any, Optional


class AppException(Exception):
    """Base application exception."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: Optional[str] = None,
        details: Optional[Any] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or "INTERNAL_ERROR"
        self.details = details
        super().__init__(self.message)


class NotFoundException(AppException):
    """Resource not found."""

    def __init__(self, resource: str, identifier: Any = None):
        message = f"{resource} not found"
        if identifier:
            message = f"{resource} with id '{identifier}' not found"
        super().__init__(message=message, status_code=404, error_code="NOT_FOUND")


class ValidationException(AppException):
    """Validation error."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            status_code=422,
            error_code="VALIDATION_ERROR",
            details=details,
        )


class ConflictException(AppException):
    """Resource conflict."""

    def __init__(self, message: str):
        super().__init__(message=message, status_code=409, error_code="CONFLICT")


class FileSizeExceededException(AppException):
    """File size exceeded."""

    def __init__(self, max_size_mb: int):
        super().__init__(
            message=f"File size exceeds the maximum allowed size of {max_size_mb}MB",
            status_code=413,
            error_code="FILE_SIZE_EXCEEDED",
        )


class InvalidFileTypeException(AppException):
    """Invalid file type."""

    def __init__(self, allowed_types: list):
        super().__init__(
            message=f"Invalid file type. Allowed types: {', '.join(allowed_types)}",
            status_code=415,
            error_code="INVALID_FILE_TYPE",
        )


class ExportException(AppException):
    """Export error."""

    def __init__(self, message: str):
        super().__init__(
            message=message, status_code=500, error_code="EXPORT_ERROR"
        )
