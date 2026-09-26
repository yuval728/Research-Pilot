from __future__ import annotations

import abc
import functools
from typing import Any

import jinja2
from pydantic import BaseModel

from src.models.output import DiagramType

_DOMAIN_JINJA_ENV = jinja2.Environment(autoescape=False)


@functools.lru_cache(maxsize=32)
def _get_compiled_domain_template(
    plugin: DomainPlugin, stage: str, version: int
) -> jinja2.Template:
    """Cache compiled Jinja2 Template object per plugin/stage/version.

    This avoids both repeated disk I/O (calling plugin.get_prompt) and
    repeated Jinja2 AST parsing overhead on domain prompt renders.
    """
    template_str = plugin.get_prompt(stage, version)
    return _DOMAIN_JINJA_ENV.from_string(template_str)


class DomainPlugin(abc.ABC):
    """Abstract base class for domain plugins."""

    domain_id: str

    @abc.abstractmethod
    def get_extraction_schema(self) -> type[BaseModel]:
        """Return the root Pydantic model for extraction in this domain."""

    @abc.abstractmethod
    def get_prompt(self, stage: str, version: int) -> str:
        """Return the raw Jinja2 template string for the given stage and version."""

    @abc.abstractmethod
    def get_diagram_types(self) -> list[DiagramType]:
        """Return the list of DiagramTypes supported by this domain."""

    @abc.abstractmethod
    def supports_codegen(self) -> bool:
        """Return True if this domain supports code generation."""

    def render_prompt(self, stage: str, version: int, **context: Any) -> str:
        """Loads and renders the Jinja2 template with the provided context."""
        template = _get_compiled_domain_template(self, stage, version)
        return template.render(**context)
