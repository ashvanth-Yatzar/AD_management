import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from dateutil.relativedelta import relativedelta

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException, ValidationException
from app.models.advertisement import Advertisement, MediaType, PlanType
from app.repositories.advertisement_repository import AdvertisementRepository
from app.schemas.advertisement import (
    AdvertisementCreate,
    AdvertisementQueryParams,
    AdvertisementResponse,
    AdvertisementUpdate,
    PaginatedAdvertisementResponse,
)


def _calculate_end_date(start_date: datetime, plan_type: PlanType) -> datetime:
    """Pure function — derives end_date from start_date + plan_type."""
    plan_deltas = {
        PlanType.ONE_WEEK: timedelta(days=7),
        PlanType.TWO_WEEKS: timedelta(days=14),
        PlanType.ONE_MONTH: relativedelta(months=1),
        PlanType.THREE_MONTHS: relativedelta(months=3),
        PlanType.SIX_MONTHS: relativedelta(months=6),
    }
    delta = plan_deltas[plan_type]
    return start_date + delta


class AdvertisementService:
    """
    Business logic layer.
    Orchestrates repository calls, file handling, and domain rules.
    """

    def __init__(self, db: Session) -> None:
        self._repo = AdvertisementRepository(db)

    # ──────────────────────────── CREATE ────────────────────────────

    def create(self, payload: AdvertisementCreate) -> AdvertisementResponse:
        end_date = _calculate_end_date(payload.start_date, payload.plan_type)
        ad = self._repo.create(payload, end_date)
        return AdvertisementResponse.model_validate(ad)

    # ──────────────────────────── READ ──────────────────────────────

    def get_by_id(self, ad_id: uuid.UUID) -> AdvertisementResponse:
        ad = self._repo.get_by_id(ad_id)
        if not ad:
            raise NotFoundException("Advertisement", ad_id)
        return AdvertisementResponse.model_validate(ad)

    def get_all(
        self, params: AdvertisementQueryParams
    ) -> PaginatedAdvertisementResponse:
        items, total = self._repo.get_all(params)
        total_pages = max(1, -(-total // params.page_size))  # ceiling division
        return PaginatedAdvertisementResponse(
            items=[AdvertisementResponse.model_validate(ad) for ad in items],
            total=total,
            page=params.page,
            page_size=params.page_size,
            total_pages=total_pages,
        )

    # ──────────────────────────── UPDATE ────────────────────────────

    def update(
        self,
        ad_id: uuid.UUID,
        payload: AdvertisementUpdate,
    ) -> AdvertisementResponse:
        ad = self._repo.get_by_id(ad_id)
        if not ad:
            raise NotFoundException("Advertisement", ad_id)

        # Recalculate end_date if start_date or plan_type changed
        new_start = payload.start_date or ad.start_date
        new_plan = payload.plan_type or ad.plan_type
        end_date = _calculate_end_date(new_start, new_plan)

        updated = self._repo.update(ad, payload, end_date)
        return AdvertisementResponse.model_validate(updated)

    def update_image_path(
        self, ad_id: uuid.UUID, image_path: str
    ) -> AdvertisementResponse:
        ad = self._repo.get_by_id(ad_id)
        if not ad:
            raise NotFoundException("Advertisement", ad_id)
        patch = AdvertisementUpdate(image_path=image_path)
        updated = self._repo.update(ad, patch)
        return AdvertisementResponse.model_validate(updated)

    # ──────────────────────────── DELETE ────────────────────────────

    def delete(self, ad_id: uuid.UUID) -> None:
        ad = self._repo.get_by_id(ad_id)
        if not ad:
            raise NotFoundException("Advertisement", ad_id)
        self._repo.soft_delete(ad)

    # ──────────────────────────── EXPORT DATA ───────────────────────

    def get_all_for_export(self) -> list[AdvertisementResponse]:
        ads = self._repo.get_all_for_export()
        return [AdvertisementResponse.model_validate(ad) for ad in ads]
