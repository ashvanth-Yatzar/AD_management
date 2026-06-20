from io import BytesIO
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.schemas.advertisement import AdvertisementResponse


_HEADER_COLOR = colors.HexColor("#1E3A5F")
_ALT_ROW_COLOR = colors.HexColor("#EBF0F7")
_WHITE = colors.white
_LIGHT_GRAY = colors.HexColor("#F8F9FA")


def generate_pdf(advertisements: list[AdvertisementResponse]) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=20 * mm,
        bottomMargin=15 * mm,
        title="Advertisement Report",
    )

    styles = getSampleStyleSheet()
    elements = []

    # ── Report title ───────────────────────────────────────────────
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=16,
        textColor=_HEADER_COLOR,
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.gray,
        spaceAfter=12,
    )
    elements.append(Paragraph("Advertisement Management Report", title_style))
    elements.append(
        Paragraph(
            f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} | Total Records: {len(advertisements)}",
            subtitle_style,
        )
    )
    elements.append(Spacer(1, 4 * mm))

    # ── Table data ─────────────────────────────────────────────────
    cell_style = ParagraphStyle("Cell", parent=styles["Normal"], fontSize=7.5, leading=10)
    header_style = ParagraphStyle(
        "Header",
        parent=styles["Normal"],
        fontSize=8,
        textColor=_WHITE,
        fontName="Helvetica-Bold",
    )

    headers = ["#", "Title", "Media Type", "Status", "Plan", "Start Date", "End Date", "Created At"]
    table_data = [[Paragraph(h, header_style) for h in headers]]

    for idx, ad in enumerate(advertisements, start=1):
        row = [
            Paragraph(str(idx), cell_style),
            Paragraph(ad.title[:60] + ("…" if len(ad.title) > 60 else ""), cell_style),
            Paragraph(ad.media_type.value, cell_style),
            Paragraph(ad.status.value.capitalize(), cell_style),
            Paragraph(ad.plan_type.value.replace("_", " ").title(), cell_style),
            Paragraph(ad.start_date.strftime("%Y-%m-%d") if ad.start_date else "", cell_style),
            Paragraph(ad.end_date.strftime("%Y-%m-%d") if ad.end_date else "", cell_style),
            Paragraph(ad.created_at.strftime("%Y-%m-%d") if ad.created_at else "", cell_style),
        ]
        table_data.append(row)

    col_widths = [10 * mm, 70 * mm, 28 * mm, 22 * mm, 28 * mm, 30 * mm, 30 * mm, 30 * mm]

    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    table_style = TableStyle(
        [
            # Header
            ("BACKGROUND", (0, 0), (-1, 0), _HEADER_COLOR),
            ("TEXTCOLOR", (0, 0), (-1, 0), _WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("ROWBACKGROUND", (0, 1), (-1, -1), [_WHITE, _ALT_ROW_COLOR]),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CCCCCC")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ]
    )
    table.setStyle(table_style)
    elements.append(table)

    def _add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(colors.gray)
        canvas.drawRightString(
            landscape(A4)[0] - 15 * mm,
            10 * mm,
            f"Page {doc.page}",
        )
        canvas.restoreState()

    doc.build(elements, onFirstPage=_add_page_number, onLaterPages=_add_page_number)
    buffer.seek(0)
    return buffer
