"""
pipeline.domains.system_design.schema
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Schemas for System Design domain.
"""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class SubDomain(str, Enum):
    """Sub-domains categorization for System Design papers."""

    DISTRIBUTED_SYSTEMS = "DISTRIBUTED_SYSTEMS"
    DATABASE_STORAGE = "DATABASE_STORAGE"
    NETWORKING = "NETWORKING"
    STREAM_PROCESSING = "STREAM_PROCESSING"
    SECURITY_INFRASTRUCTURE = "SECURITY_INFRASTRUCTURE"
    OTHER = "OTHER"


class ClassificationResult(BaseModel):
    """Result of classifying a paper's domain visually and textually."""

    model_config = ConfigDict(populate_by_name=True)

    domain: str = Field(
        ..., description="High-level domain, e.g. 'AI/ML' or 'System Design'."
    )
    sub_domain: SubDomain = Field(..., description="Specific sub-domain mapping.")
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Confidence score from 0 to 1."
    )
    reasoning: str | None = Field(
        default=None, description="Brief reasoning for classification."
    )


class SystemComponent(BaseModel):
    """A discrete component of the proposed system architecture."""

    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(
        ..., description="Short identifier, e.g. 'Load Balancer', 'Metadata Store'."
    )
    type: str = Field(
        ...,
        description="Component category, e.g. 'cache', 'database', 'service', 'queue', 'proxy'.",
    )
    description: str = Field(
        ..., description="Plain-language description of what this component does."
    )
    responsibilities: list[str] = Field(
        default_factory=list,
        description="Key responsibilities assigned to this component.",
    )
    technology: str | None = Field(
        default=None,
        description="Technology stack or implementation details if specified.",
    )


class SystemInterface(BaseModel):
    """An API endpoint or interface exposed by/between components."""

    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(
        ..., description="Interface or endpoint name, e.g. 'ReadRPC', '/v1/ingest'."
    )
    description: str = Field(
        ..., description="Plain-language description of the interface function."
    )
    protocol: str | None = Field(
        default=None,
        description="Protocol used, e.g. 'gRPC', 'HTTP/REST', 'TCP', 'Kafka'.",
    )
    input_format: str | None = Field(
        default=None, description="Input arguments or payload format."
    )
    output_format: str | None = Field(
        default=None, description="Response payload format or returned status."
    )


class DataFlowStep(BaseModel):
    """A data flow path or interaction sequence between components."""

    model_config = ConfigDict(populate_by_name=True)

    source_component: str = Field(..., description="Source component name.")
    target_component: str = Field(..., description="Target component name.")
    description: str = Field(
        ..., description="Description of data transferred or interaction."
    )
    protocol: str | None = Field(
        default=None, description="Protocol or transport mechanism used."
    )
    step_number: int | None = Field(
        default=None,
        description="Step order in the overall sequence if applicable.",
    )


class ScalabilityMechanism(BaseModel):
    """A mechanism used to scale the system or handle high throughput/load."""

    model_config = ConfigDict(populate_by_name=True)

    mechanism_type: str = Field(
        ...,
        description="Scalability strategy, e.g. 'sharding', 'replication', 'partitioning', 'caching'.",
    )
    description: str = Field(
        ..., description="How the mechanism is implemented and operates."
    )
    bottleneck_addressed: str | None = Field(
        default=None,
        description="The specific bottleneck or capacity risk addressed.",
    )


class TradeOff(BaseModel):
    """An architectural trade-off or compromise made in the system design."""

    model_config = ConfigDict(populate_by_name=True)

    decision: str = Field(
        ..., description="The architectural choice or design decision made."
    )
    pros: list[str] = Field(
        default_factory=list, description="Benefits or advantages gained."
    )
    cons: list[str] = Field(
        default_factory=list, description="Drawbacks, costs, or limitations accepted."
    )
    rationale: str | None = Field(
        default=None, description="Context or reasoning for choosing this trade-off."
    )


class SystemDesignExtraction(BaseModel):
    """Structured information extracted from a System Design research paper.

    Every field is optional at the schema level — partial extractions are
    valid and expected when the paper does not cover a particular aspect.
    """

    model_config = ConfigDict(populate_by_name=True)

    system_name: str | None = Field(
        default=None,
        description="Name of the system described, e.g. 'Spanner', 'Kafka'.",
    )
    problem_statement: str | None = Field(
        default=None,
        description="Core problem or challenge the system solves.",
    )
    key_requirements: list[str] = Field(
        default_factory=list,
        description="Functional and non-functional requirements.",
    )
    proposed_architecture_summary: str | None = Field(
        default=None,
        description="High-level overview of the overall system architecture.",
    )
    components: list[SystemComponent] = Field(
        default_factory=list,
        description="Decomposed system components.",
    )
    interfaces: list[SystemInterface] = Field(
        default_factory=list,
        description="Interfaces and endpoints between components.",
    )
    data_flows: list[DataFlowStep] = Field(
        default_factory=list,
        description="Data flow paths and interactions.",
    )
    scalability: list[ScalabilityMechanism] = Field(
        default_factory=list,
        description="Scalability and high-availability mechanisms.",
    )
    trade_offs: list[TradeOff] = Field(
        default_factory=list,
        description="Architectural trade-offs made in the design.",
    )
    fault_tolerance: str | None = Field(
        default=None,
        description="Fault tolerance, recovery, and resilience mechanisms.",
    )
    limitations: str | None = Field(
        default=None,
        description="System limitations or non-goals acknowledged by authors.",
    )
    future_work: str | None = Field(
        default=None,
        description="Future directions or planned enhancements.",
    )
    visual_elements_description: str | None = Field(
        default=None,
        description="Description of system diagrams, architecture figures, or tables.",
    )
