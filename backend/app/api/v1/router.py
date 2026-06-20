from fastapi import APIRouter

from app.api.v1.endpoints.advertisements import router as advertisements_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(advertisements_router)
