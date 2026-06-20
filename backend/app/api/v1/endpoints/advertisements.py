import os
import uuid
import shutil
from pathlib import Path
from typing import Optional, List

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import (
    FileSizeExceededException,
    InvalidFileTypeException,
    ValidationException,
)
from app.db.session import get_db
from app.models.advertisement import AdvertisementStatus, MediaType, PlanType
from app.schemas.advertisement import (
    AdvertisementCreate,
    AdvertisementQueryParams,
    AdvertisementResponse,
    AdvertisementUpdate,
    PaginatedAdvertisementResponse,
)
from app.services.advertisement_service import AdvertisementService
from app.services.export_service import ExportService

router = APIRouter(prefix="/advertisements", tags=["Advertisements"])


# ──────────────────────────── Helpers ───────────────────────────────────────

def _get_ad_service(db: Session = Depends(get_db)) -> AdvertisementService:
    return AdvertisementService(db)


def _get_export_service(db: Session = Depends(get_db)) -> ExportService:
    return ExportService(db)


def _save_upload(file: UploadFile) -> str:
    """Validates and persists an uploaded image. Returns relative path."""
    if file.content_type not in settings.get_allowed_image_types():
        raise InvalidFileTypeException(settings.get_allowed_image_types())

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix.lower()
    filename = f"{uuid.uuid4()}{ext}"
    dest = upload_dir / filename

    with dest.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Verify file size after write
    if dest.stat().st_size > settings.max_file_size_bytes:
        dest.unlink(missing_ok=True)
        raise FileSizeExceededException(settings.MAX_FILE_SIZE_MB)

    return str(dest)


def _success_response(data, message: str = "Success"):
    return {"success": True, "message": message, "data": data}


# ──────────────────────────── CRUD Endpoints ────────────────────────────────

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new advertisement",
)
async def create_advertisement(
    title: str = Form(..., max_length=200),
    content: str = Form(...),
    media_type: MediaType = Form(...),
    status_field: AdvertisementStatus = Form(AdvertisementStatus.DRAFT, alias="status"),
    plan_type: PlanType = Form(...),
    start_date: str = Form(...),
    media_url: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    service: AdvertisementService = Depends(_get_ad_service),
):
    from datetime import datetime

    try:
        parsed_start = datetime.fromisoformat(start_date)
    except ValueError:
        raise ValidationException("Invalid start_date format. Use ISO 8601.")

    image_path: Optional[str] = None
    if media_type == MediaType.IMAGE_UPLOAD:
        if not image:
            raise ValidationException("image file is required when media_type is 'image_upload'")
        image_path = _save_upload(image)

    payload = AdvertisementCreate(
        title=title,
        content=content,
        media_type=media_type,
        image_path=image_path,
        media_url=media_url,
        status=status_field,
        plan_type=plan_type,
        start_date=parsed_start,
    )
    result = service.create(payload)
    return _success_response(result, "Advertisement created successfully")


@router.get(
    "/",
    response_model=None,
    summary="List advertisements with pagination and filtering",
)
def list_advertisements(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[AdvertisementStatus] = Query(None),
    media_type: Optional[MediaType] = Query(None),
    sort_by: str = Query(default="created_at"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    service: AdvertisementService = Depends(_get_ad_service),
):
    params = AdvertisementQueryParams(
        page=page,
        page_size=page_size,
        search=search,
        status=status,
        media_type=media_type,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    result = service.get_all(params)
    return _success_response(result)


@router.get(
    "/export/excel",
    summary="Export advertisements as Excel",
)
def export_excel(
    ids: Optional[str] = Query(None, description="Comma-separated advertisement IDs for page export"),
    service: ExportService = Depends(_get_export_service),
):
    id_list = ids.split(",") if ids else None
    buffer = service.export_excel(id_list)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=advertisements.xlsx"},
    )


@router.get(
    "/export/pdf",
    summary="Export advertisements as PDF",
)
def export_pdf(
    ids: Optional[str] = Query(None, description="Comma-separated advertisement IDs for page export"),
    service: ExportService = Depends(_get_export_service),
):
    id_list = ids.split(",") if ids else None
    buffer = service.export_pdf(id_list)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=advertisements.pdf"},
    )


@router.get(
    "/export/word",
    summary="Export advertisements as Word document",
)
def export_word(
    ids: Optional[str] = Query(None, description="Comma-separated advertisement IDs for page export"),
    service: ExportService = Depends(_get_export_service),
):
    id_list = ids.split(",") if ids else None
    buffer = service.export_word(id_list)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": "attachment; filename=advertisements.docx"},
    )


@router.get(
    "/{ad_id}",
    summary="Get a single advertisement by ID",
)
def get_advertisement(
    ad_id: uuid.UUID,
    service: AdvertisementService = Depends(_get_ad_service),
):
    result = service.get_by_id(ad_id)
    return _success_response(result)


@router.put(
    "/{ad_id}",
    summary="Update an advertisement",
)
async def update_advertisement(
    ad_id: uuid.UUID,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    media_type: Optional[MediaType] = Form(None),
    status_field: Optional[AdvertisementStatus] = Form(None, alias="status"),
    plan_type: Optional[PlanType] = Form(None),
    start_date: Optional[str] = Form(None),
    media_url: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    service: AdvertisementService = Depends(_get_ad_service),
):
    from datetime import datetime

    parsed_start = None
    if start_date:
        try:
            parsed_start = datetime.fromisoformat(start_date)
        except ValueError:
            raise ValidationException("Invalid start_date format. Use ISO 8601.")

    image_path: Optional[str] = None
    if image and image.filename:
        image_path = _save_upload(image)

    payload = AdvertisementUpdate(
        title=title,
        content=content,
        media_type=media_type,
        image_path=image_path,
        media_url=media_url,
        status=status_field,
        plan_type=plan_type,
        start_date=parsed_start,
    )
    result = service.update(ad_id, payload)
    return _success_response(result, "Advertisement updated successfully")


@router.delete(
    "/{ad_id}",
    status_code=status.HTTP_200_OK,
    summary="Soft-delete an advertisement",
)
def delete_advertisement(
    ad_id: uuid.UUID,
    service: AdvertisementService = Depends(_get_ad_service),
):
    service.delete(ad_id)
    return _success_response(None, "Advertisement deleted successfully")
