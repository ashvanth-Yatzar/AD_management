import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator, model_validator

from app.models.advertisement import AdvertisementStatus, MediaType, PlanType


# ─────────────────────────── Base ────────────────────────────

class AdvertisementBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Advertisement title")
    content: str = Field(..., min_length=1, description="Rich-text HTML content")
    media_type: MediaType = Field(..., description="Type of media: image_upload or url")
    media_url: Optional[str] = Field(None, max_length=2048, description="URL when media_type=url")
    status: AdvertisementStatus = Field(default=AdvertisementStatus.DRAFT)
    plan_type: PlanType = Field(..., description="Duration plan")
    start_date: datetime = Field(..., description="Campaign start date-time (UTC)")

    @field_validator("title")
    @classmethod
    def strip_title(cls, v: str) -> str:
        return v.strip()

    @field_validator("media_url", mode="before")
    @classmethod
    def validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("media_url must start with http:// or https://")
        return v

    @model_validator(mode="after")
    def validate_media_fields(self) -> "AdvertisementBase":
        if self.media_type == MediaType.URL and not self.media_url:
            raise ValueError("media_url is required when media_type is 'url'")
        return self


# ─────────────────────────── Create ──────────────────────────

class AdvertisementCreate(AdvertisementBase):
    """DTO for creating a new advertisement (image_path set after file upload)."""
    image_path: Optional[str] = Field(None)


# ─────────────────────────── Update ──────────────────────────

class AdvertisementUpdate(BaseModel):
    """DTO for partial update — all fields optional."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    media_type: Optional[MediaType] = None
    image_path: Optional[str] = None
    media_url: Optional[str] = Field(None, max_length=2048)
    status: Optional[AdvertisementStatus] = None
    plan_type: Optional[PlanType] = None
    start_date: Optional[datetime] = None

    @field_validator("media_url", mode="before")
    @classmethod
    def validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("media_url must start with http:// or https://")
        return v


# ─────────────────────────── Response ────────────────────────

class AdvertisementResponse(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    media_type: MediaType
    image_path: Optional[str]
    media_url: Optional[str]
    status: AdvertisementStatus
    plan_type: PlanType
    start_date: datetime
    end_date: datetime
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────── Paginated List ──────────────────

class PaginatedAdvertisementResponse(BaseModel):
    items: list[AdvertisementResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ─────────────────────────── Query Params ────────────────────

class AdvertisementQueryParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)
    search: Optional[str] = Field(None, max_length=200)
    status: Optional[AdvertisementStatus] = None
    media_type: Optional[MediaType] = None
    sort_by: str = Field(default="created_at")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")
