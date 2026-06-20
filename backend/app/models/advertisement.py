import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class MediaType(str, enum.Enum):
    IMAGE_UPLOAD = "image_upload"
    URL = "url"


class AdvertisementStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    SCHEDULED = "scheduled"
    PAUSED = "paused"
    EXPIRED = "expired"


class PlanType(str, enum.Enum):
    ONE_WEEK = "1_week"
    TWO_WEEKS = "2_weeks"
    ONE_MONTH = "1_month"
    THREE_MONTHS = "3_months"
    SIX_MONTHS = "6_months"


class Advertisement(Base):
    __tablename__ = "advertisements"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    media_type: Mapped[MediaType] = mapped_column(
        Enum(
            MediaType,
            values_callable=lambda obj: [e.value for e in obj],
            name="mediatype",
        ),
        nullable=False,
    )

    image_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    media_url: Mapped[str | None] = mapped_column(
        String(2048),
        nullable=True,
    )

    status: Mapped[AdvertisementStatus] = mapped_column(
        Enum(
            AdvertisementStatus,
            values_callable=lambda obj: [e.value for e in obj],
            name="advertisementstatus",
        ),
        nullable=False,
        default=AdvertisementStatus.DRAFT,
        index=True,
    )

    plan_type: Mapped[PlanType] = mapped_column(
        Enum(
            PlanType,
            values_callable=lambda obj: [e.value for e in obj],
            name="plantype",
        ),
        nullable=False,
    )

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return (
            f"<Advertisement "
            f"id={self.id} "
            f"title={self.title!r} "
            f"status={self.status}>"
        )