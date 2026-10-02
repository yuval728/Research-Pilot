"""
pipeline/core/__init__.py
Public re-exports for the core module.
"""

from src.core.config import AppSettings, get_settings
from src.core.events import Event, EventBus, EventType
from src.core.exceptions import (
    DuplicatePaperError,
    EmbeddingError,
    FileUploadError,
    IngestionError,
    LLMError,
    LLMRateLimitError,
    LLMTimeoutError,
    LLMValidationError,
    PDFFetchError,
    PipelineError,
    ResearchPilotError,
    StageError,
    StorageError,
    StorageFileNotFoundError,
    TokenBudgetExceededError,
)
from src.core.logger import get_logger
from src.core.telemetry import TelemetryCollector, TelemetryRecord, track_llm_call

__all__ = [
    "AppSettings",
    "DuplicatePaperError",
    "EmbeddingError",
    "Event",
    "EventBus",
    "EventType",
    "FileUploadError",
    "IngestionError",
    "LLMError",
    "LLMRateLimitError",
    "LLMTimeoutError",
    "LLMValidationError",
    "PDFFetchError",
    "PipelineError",
    "ResearchPilotError",
    "StageError",
    "StorageError",
    "StorageFileNotFoundError",
    "TelemetryCollector",
    "TelemetryRecord",
    "TokenBudgetExceededError",
    "get_logger",
    "get_settings",
    "track_llm_call",
]
