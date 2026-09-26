"""
pipeline.models
~~~~~~~~~~~~~~~
Pure Pydantic data models. No business logic, no database operations, no LLM
calls. Just data shapes and validation. Everything in the pipeline passes
these models between stages.
"""

from src.models.extraction import (
    ExtractionResult,
)
from src.models.output import (
    CodeOutput,
    DiagramOutput,
    DiagramType,
    OutputBundle,
    ReportOutput,
    SummaryLevel,
    SummaryOutput,
)
from src.models.paper import (
    Paper,
    PaperCreate,
    PaperMetadata,
    PaperSource,
)
from src.models.run import (
    PipelineRun,
    RunStatus,
    StageResult,
    StageStatus,
)

__all__ = [
    "CodeOutput",
    "DiagramOutput",
    "DiagramType",
    "ExtractionResult",
    "OutputBundle",
    "Paper",
    "PaperCreate",
    "PaperMetadata",
    "PaperSource",
    "PipelineRun",
    "ReportOutput",
    "RunStatus",
    "StageResult",
    "StageStatus",
    "SummaryLevel",
    "SummaryOutput",
]
