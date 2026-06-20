"""Initial advertisement table

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Build everything with a single raw SQL block to avoid SQLAlchemy
    # auto-creating/conflicting with enum types.
    op.execute("""
        CREATE TYPE mediatype AS ENUM ('image_upload', 'url');

        CREATE TYPE advertisementstatus AS ENUM
            ('draft', 'active', 'scheduled', 'paused', 'expired');

        CREATE TYPE plantype AS ENUM
            ('1_week', '2_weeks', '1_month', '3_months', '6_months');

        CREATE TABLE advertisements (
            id          UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
            title       VARCHAR(200)            NOT NULL,
            content     TEXT                    NOT NULL,
            media_type  mediatype               NOT NULL,
            image_path  VARCHAR(500),
            media_url   VARCHAR(2048),
            status      advertisementstatus     NOT NULL DEFAULT 'draft',
            plan_type   plantype                NOT NULL,
            start_date  TIMESTAMPTZ             NOT NULL,
            end_date    TIMESTAMPTZ             NOT NULL,
            is_deleted  BOOLEAN                 NOT NULL DEFAULT FALSE,
            created_at  TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ             NOT NULL DEFAULT NOW()
        );

        CREATE INDEX ix_advertisements_id     ON advertisements (id);
        CREATE INDEX ix_advertisements_title  ON advertisements (title);
        CREATE INDEX ix_advertisements_status ON advertisements (status);
    """)


def downgrade() -> None:
    op.execute("""
        DROP TABLE  IF EXISTS advertisements CASCADE;
        DROP TYPE   IF EXISTS plantype            CASCADE;
        DROP TYPE   IF EXISTS advertisementstatus CASCADE;
        DROP TYPE   IF EXISTS mediatype           CASCADE;
    """)
