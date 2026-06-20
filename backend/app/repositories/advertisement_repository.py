import uuid
from typing import Optional, Tuple

from sqlalchemy import asc, desc, func, or_, select, update
from sqlalchemy.orm import Session

from app.models.advertisement import Advertisement, AdvertisementStatus, MediaType
from app.schemas.advertisement import (
    AdvertisementCreate,
    AdvertisementQueryParams,
    AdvertisementUpdate,
)


class AdvertisementRepository:
    """
    Data access layer — all database interactions live here.
    No business logic. No HTTP concerns.
    """

    def __init__(self, db: Session) -> None:
        self._db = db

    # ──────────────────────────── CREATE ────────────────────────────

    def create(self, payload: AdvertisementCreate, end_date) -> Advertisement:
        ad = Advertisement(
            title=payload.title,
            content=payload.content,
            media_type=payload.media_type,
            image_path=payload.image_path,
            media_url=payload.media_url,
            status=payload.status,
            plan_type=payload.plan_type,
            start_date=payload.start_date,
            end_date=end_date,
        )
        self._db.add(ad)
        self._db.commit()
        self._db.refresh(ad)
        return ad

    # ──────────────────────────── READ ──────────────────────────────

    def get_by_id(self, ad_id: uuid.UUID) -> Optional[Advertisement]:
        stmt = (
            select(Advertisement)
            .where(Advertisement.id == ad_id, Advertisement.is_deleted.is_(False))
        )
        return self._db.execute(stmt).scalar_one_or_none()

    def get_all(
        self, params: AdvertisementQueryParams
    ) -> Tuple[list[Advertisement], int]:
        stmt = select(Advertisement).where(Advertisement.is_deleted.is_(False))

        # Filter: search
        if params.search:
            search_term = f"%{params.search}%"
            stmt = stmt.where(
                or_(
                    Advertisement.title.ilike(search_term),
                    Advertisement.content.ilike(search_term),
                )
            )

        # Filter: status
        if params.status:
            stmt = stmt.where(Advertisement.status == params.status)

        # Filter: media_type
        if params.media_type:
            stmt = stmt.where(Advertisement.media_type == params.media_type)

        # Total count (before pagination)
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total: int = self._db.execute(count_stmt).scalar_one()

        # Sorting
        sort_column = getattr(Advertisement, params.sort_by, Advertisement.created_at)
        order_fn = desc if params.sort_order == "desc" else asc
        stmt = stmt.order_by(order_fn(sort_column))

        # Pagination
        offset = (params.page - 1) * params.page_size
        stmt = stmt.offset(offset).limit(params.page_size)

        items = list(self._db.execute(stmt).scalars().all())
        return items, total

    def get_all_for_export(
        self,
        status: Optional[AdvertisementStatus] = None,
        media_type: Optional[MediaType] = None,
    ) -> list[Advertisement]:
        stmt = (
            select(Advertisement)
            .where(Advertisement.is_deleted.is_(False))
            .order_by(desc(Advertisement.created_at))
        )
        if status:
            stmt = stmt.where(Advertisement.status == status)
        if media_type:
            stmt = stmt.where(Advertisement.media_type == media_type)
        return list(self._db.execute(stmt).scalars().all())

    # ──────────────────────────── UPDATE ────────────────────────────

    def update(
        self,
        ad: Advertisement,
        payload: AdvertisementUpdate,
        end_date=None,
    ) -> Advertisement:
        update_data = payload.model_dump(exclude_unset=True)
        if end_date is not None:
            update_data["end_date"] = end_date

        for field, value in update_data.items():
            setattr(ad, field, value)

        self._db.commit()
        self._db.refresh(ad)
        return ad

    # ──────────────────────────── DELETE ────────────────────────────

    def soft_delete(self, ad: Advertisement) -> Advertisement:
        ad.is_deleted = True
        self._db.commit()
        self._db.refresh(ad)
        return ad
