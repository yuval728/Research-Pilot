"""
Unit tests for System Design domain plugin and schema validation.
"""

import pytest
from pydantic import ValidationError

from src.domains.registry import DomainNotFoundError, registry
from src.domains.system_design.plugin import SystemDesignPlugin
from src.domains.system_design.schema import (
    ClassificationResult,
    DataFlowStep,
    ScalabilityMechanism,
    SubDomain,
    SystemComponent,
    SystemDesignExtraction,
    SystemInterface,
    TradeOff,
)
from src.models.output import DiagramType


def test_registry_auto_discover_and_get():
    """Test that auto_discover registers the system_design plugin."""
    registry.auto_discover()
    plugin = registry.get("system_design")
    assert isinstance(plugin, SystemDesignPlugin)
    assert plugin.domain_id == "system_design"


def test_registry_get_nonexistent():
    """Test that registry raises DomainNotFoundError for unknown domain."""
    with pytest.raises(DomainNotFoundError):
        registry.get("nonexistent_domain_123")


def test_plugin_properties():
    """Test SystemDesignPlugin interface methods."""
    plugin = SystemDesignPlugin()
    assert plugin.domain_id == "system_design"
    assert plugin.get_extraction_schema() == SystemDesignExtraction
    assert plugin.supports_codegen() is True

    diagram_types = plugin.get_diagram_types()
    assert DiagramType.ARCHITECTURE in diagram_types
    assert len(diagram_types) > 0


def test_plugin_prompts_rendering():
    """Test getting and rendering prompt templates for all stages."""
    plugin = SystemDesignPlugin()
    stages = ["classify", "extract", "summarise", "diagram", "codegen"]

    for stage in stages:
        raw_prompt = plugin.get_prompt(stage, 1)
        assert len(raw_prompt) > 0

        # Render prompt with sample context
        rendered = plugin.render_prompt(
            stage,
            1,
            extraction_json="{}",
            summary_level="paragraph",
            diagram_type="architecture",
            components=[],
            interfaces=[],
            data_flows=[],
            scalability=[],
        )
        assert isinstance(rendered, str)
        assert len(rendered) > 0


def test_plugin_prompt_not_found():
    """Test FileNotFoundError raised for non-existent prompt stage or version."""
    plugin = SystemDesignPlugin()
    with pytest.raises(FileNotFoundError):
        plugin.get_prompt("nonexistent_stage", 999)


def test_sub_domain_enum():
    """Test SubDomain enum values."""
    assert SubDomain.DISTRIBUTED_SYSTEMS.value == "DISTRIBUTED_SYSTEMS"
    assert SubDomain.DATABASE_STORAGE.value == "DATABASE_STORAGE"
    assert SubDomain.NETWORKING.value == "NETWORKING"
    assert SubDomain.STREAM_PROCESSING.value == "STREAM_PROCESSING"
    assert SubDomain.SECURITY_INFRASTRUCTURE.value == "SECURITY_INFRASTRUCTURE"
    assert SubDomain.OTHER.value == "OTHER"


def test_classification_result_validation():
    """Test ClassificationResult model validation."""
    valid_res = ClassificationResult(
        domain="System Design",
        sub_domain=SubDomain.DATABASE_STORAGE,
        confidence=0.95,
        reasoning="Paper describes a distributed key-value store.",
    )
    assert valid_res.domain == "System Design"
    assert valid_res.sub_domain == SubDomain.DATABASE_STORAGE
    assert valid_res.confidence == 0.95

    # Invalid confidence score (> 1.0)
    with pytest.raises(ValidationError):
        ClassificationResult(
            domain="System Design",
            sub_domain=SubDomain.DISTRIBUTED_SYSTEMS,
            confidence=1.5,
        )


def test_system_design_extraction_full():
    """Test full SystemDesignExtraction schema with nested models."""
    extraction = SystemDesignExtraction(
        system_name="Spanner",
        problem_statement="Globally distributed transactions with external consistency.",
        key_requirements=[
            "External consistency",
            "High availability",
            "Global scalability",
        ],
        proposed_architecture_summary="A multi-version database layered on Paxos groups and TrueTime.",
        components=[
            SystemComponent(
                name="Zone Master",
                type="master",
                description="Allocates data to zone location proxies.",
                responsibilities=["Data location tracking", "Load balancing across zones"],
                technology="C++",
            ),
            SystemComponent(
                name="SpanServer",
                type="worker",
                description="Serves data to clients via Paxos replication.",
                responsibilities=["Data storage", "Transaction handling"],
                technology="C++ / Paxos",
            ),
        ],
        interfaces=[
            SystemInterface(
                name="ReadWriteTransactionRPC",
                description="Executes a distributed read-write transaction.",
                protocol="gRPC",
                input_format="TransactionRequest",
                output_format="TransactionResponse",
            )
        ],
        data_flows=[
            DataFlowStep(
                source_component="Client",
                target_component="SpanServer",
                description="Client issues read request to leader SpanServer.",
                protocol="gRPC",
                step_number=1,
            )
        ],
        scalability=[
            ScalabilityMechanism(
                mechanism_type="sharding",
                description="Data split across directories and tablets.",
                bottleneck_addressed="Single-node storage and throughput limits",
            )
        ],
        trade_offs=[
            TradeOff(
                decision="TrueTime hardware synchronization",
                pros=["External consistency without communication"],
                cons=["Requires GPS receiver and atomic clock hardware"],
                rationale="Provides linearizability at global scale.",
            )
        ],
        fault_tolerance="Paxos consensus for tablet replication with automatic leader failover.",
        limitations="Requires specialized TrueTime hardware.",
        future_work="Improving cross-datacenter latency.",
        visual_elements_description="Figure 1 shows the server hierarchy including zonemaster and spanerservers.",
    )

    dumped = extraction.model_dump(mode="json")
    assert dumped["system_name"] == "Spanner"
    assert len(dumped["components"]) == 2
    assert len(dumped["interfaces"]) == 1
    assert len(dumped["data_flows"]) == 1
    assert len(dumped["scalability"]) == 1
    assert len(dumped["trade_offs"]) == 1

    # Round trip validation
    reloaded = SystemDesignExtraction.model_validate(dumped)
    assert reloaded.system_name == "Spanner"
    assert reloaded.components[0].name == "Zone Master"
    assert reloaded.trade_offs[0].decision == "TrueTime hardware synchronization"


def test_system_design_extraction_defaults():
    """Test SystemDesignExtraction defaults (empty/None fields)."""
    extraction = SystemDesignExtraction()
    assert extraction.system_name is None
    assert extraction.components == []
    assert extraction.interfaces == []
    assert extraction.data_flows == []
    assert extraction.scalability == []
    assert extraction.trade_offs == []
