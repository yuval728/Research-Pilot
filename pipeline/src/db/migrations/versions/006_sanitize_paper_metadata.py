"""sanitize_paper_metadata

Revision ID: 006
Revises: 005
Create Date: 2026-06-11 00:00:00.000000
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "006"
down_revision: str | Sequence[str] | None = "005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE papers
        SET metadata = NULL
        WHERE metadata IS NOT NULL
          AND jsonb_typeof(metadata) <> 'object'
        """
    )


def downgrade() -> None:
    pass
