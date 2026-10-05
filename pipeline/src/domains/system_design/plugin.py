"""
pipeline.domains.system_design.plugin
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Domain Plugin implementation for System Design papers.
"""

from pathlib import Path

from pydantic import BaseModel

from src.domains.base import DomainPlugin
from src.domains.registry import registry
from src.domains.system_design.schema import SystemDesignExtraction
from src.models.output import DiagramType


class SystemDesignPlugin(DomainPlugin):
    """Domain Plugin implementation for System Design papers."""

    domain_id = "system_design"

    def get_extraction_schema(self) -> type[BaseModel]:
        return SystemDesignExtraction

    def get_prompt(self, stage: str, version: int) -> str:
        prompt_path = Path(__file__).parent / "prompts" / f"{stage}_v{version}.j2"
        if not prompt_path.exists():
            raise FileNotFoundError(
                f"Prompt template not found for stage {stage} v{version}: {prompt_path}"
            )
        return prompt_path.read_text(encoding="utf-8")

    def get_diagram_types(self) -> list[DiagramType]:
        return [
            DiagramType.ARCHITECTURE,
            DiagramType.TRAINING_FLOW,
            DiagramType.INFERENCE_FLOW,
        ]

    def supports_codegen(self) -> bool:
        return True


# Auto-register the plugin when this module is imported by registry.auto_discover()
registry.register(SystemDesignPlugin())
