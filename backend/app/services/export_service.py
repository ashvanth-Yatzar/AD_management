from io import BytesIO

from sqlalchemy.orm import Session

from app.repositories.advertisement_repository import AdvertisementRepository
from app.schemas.advertisement import AdvertisementResponse
from app.utils.excel_export import generate_excel
from app.utils.pdf_export import generate_pdf
from app.utils.word_export import generate_word
from app.core.exceptions import ExportException


class ExportService:
    """
    Orchestrates data retrieval and delegates to format-specific generators.
    Keeping export logic isolated from the main service for SRP.
    """

    def __init__(self, db: Session) -> None:
        self._repo = AdvertisementRepository(db)

    def _fetch_records(
        self, ids: list[str] | None = None
    ) -> list[AdvertisementResponse]:
        if ids:
            records = []
            for id_str in ids:
                import uuid
                try:
                    ad = self._repo.get_by_id(uuid.UUID(id_str))
                    if ad:
                        records.append(AdvertisementResponse.model_validate(ad))
                except ValueError:
                    pass
            return records
        ads = self._repo.get_all_for_export()
        return [AdvertisementResponse.model_validate(ad) for ad in ads]

    def export_excel(self, ids: list[str] | None = None) -> BytesIO:
        try:
            records = self._fetch_records(ids)
            return generate_excel(records)
        except Exception as exc:
            raise ExportException(f"Excel export failed: {exc}") from exc

    def export_pdf(self, ids: list[str] | None = None) -> BytesIO:
        try:
            records = self._fetch_records(ids)
            return generate_pdf(records)
        except Exception as exc:
            raise ExportException(f"PDF export failed: {exc}") from exc

    def export_word(self, ids: list[str] | None = None) -> BytesIO:
        try:
            records = self._fetch_records(ids)
            return generate_word(records)
        except Exception as exc:
            raise ExportException(f"Word export failed: {exc}") from exc
