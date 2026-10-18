"""
pipeline.models.batch
~~~~~~~~~~~~~~~~~~~~~
Data models for batch pipeline requests, responses, and status tracking.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class BatchJobStatus(str, Enum):
    """Top-level status of a batch job processing multiple papers."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    PARTIAL = "partial"
    FAILED = "failed"


class BatchItemStatus(str, Enum):
    """Status of an individual paper item within a batch job."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class BatchProcessRequest(BaseModel):
    """Payload for initiating a batch pipeline run."""

    paper_ids: list[uuid.UUID] = Field(
        ...,
        min_length=1,
        description="List of paper UUIDs to process in batch.",
    )


class BatchJobItemResponse(BaseModel):
    """Status record for a single paper in a batch job."""

    model_config = ConfigDict(populate_by_name=True)

    id: uuid.UUID
    batch_id: uuid.UUID
    paper_id: uuid.UUID
    run_id: uuid.UUID | None = None
    status: BatchItemStatus = BatchItemStatus.PENDING
    error: str | None = None
    created_at: datetime
    updated_at: datetime


class BatchJobResponse(BaseModel):
    """Status record for an entire batch job."""

    model_config = ConfigDict(populate_by_name=True)

    id: uuid.UUID
    user_id: uuid.UUID | None = None
    status: BatchJobStatus = BatchJobStatus.PENDING
    total_papers: int = 0
    completed_papers: int = 0
    failed_papers: int = 0
    items: list[BatchJobItemResponse] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
