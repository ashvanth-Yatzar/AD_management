import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.middlewares.error_handler import (
    app_exception_handler,
    integrity_error_handler,
    sqlalchemy_error_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure upload directory exists on startup
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    logger.info("Advertisement Management System started")
    yield
    logger.info("Advertisement Management System shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise-grade Advertisement Management REST API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    redirect_slashes=False,
)

# ── CORS ───────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (uploaded images) ────────────────────────────────────────
uploads_path = Path(settings.UPLOAD_DIR)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# ── Exception handlers ─────────────────────────────────────────────────────
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_error_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(api_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
