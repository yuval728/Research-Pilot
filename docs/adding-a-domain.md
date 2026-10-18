# Adding A Domain

Domain plugins let Research Pilot support new paper families without changing the core graph.

## Built-In Domains

Research Pilot includes built-in domain plugins under `pipeline/src/domains/`:

- `ai_ml`: AI/ML research papers (models, tasks, datasets, loss functions, metrics).
- `system_design`: System Design research papers (components, interfaces, data flows, scalability, trade-offs).

## Folder Layout

To add a new domain, create a folder under `pipeline/src/domains/<domain_id>/`:

```text
pipeline/src/domains/system_design/
  __init__.py
  plugin.py
  schema.py
  prompts/
    classify_v1.j2
    extract_v1.j2
    summarise_v1.j2
    diagram_v1.j2
    codegen_v1.j2
```

## Plugin

`plugin.py` should subclass `DomainPlugin` and register itself with `pipeline/src/domains/registry.py`:

```python
from src.domains.base import DomainPlugin
from src.domains.registry import registry

class SystemDesignPlugin(DomainPlugin):
    domain_id = "system_design"
    ...

registry.register(SystemDesignPlugin())
```

Use `pipeline/src/domains/ai_ml/plugin.py` or `pipeline/src/domains/system_design/plugin.py` as reference implementations.

## Schemas

Keep schemas narrow and reviewable. A good domain schema should capture:

- The core problem statement.
- The proposed method or system design architecture.
- Components, interfaces, and data flows.
- Scalability mechanisms and trade-offs.
- Evaluation setup, limitations, and future work.

## Prompts

Prompts should ask for structured evidence, not just conclusions. Include instructions for:

- Where the evidence came from in the paper.
- How to handle missing information.
- What should be omitted instead of hallucinated.
- Domain-specific diagram conventions.

## Tests

Add tests (e.g. in `pipeline/tests/unit/test_domain_<domain_id>.py`) for:

- Plugin discovery (`registry.auto_discover()`).
- Schema validation.
- Prompt template loading and rendering.
- Representative extraction fixtures.

## Acceptance Checklist

- The domain auto-discovers at API startup (`DomainRegistry.auto_discover()`).
- Classification can route a matching paper to the new domain.
- Extraction returns typed data matching the domain's extraction model.
- Downstream summary, diagram, and report stages can consume the domain output.
- Documentation includes any domain-specific setup.
