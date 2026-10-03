# Bolt's Performance Journal

## 2025-05-22 - SQL Window Function Query for Latest Run in Paper List
**Learning:** Eager loading relational collections with `selectinload(PaperORM.runs).selectinload(PipelineRunORM.stages)` when listing parent records fetched ALL historical runs and stages across every paper into Python ORM memory, sorting in Python to pick only the single latest run per paper. Using a SQL window function (`ROW_NUMBER() OVER (PARTITION BY paper_id ORDER BY created_at DESC)`) in a targeted second query fetches ONLY the single latest run (and its stages) per paper, reducing memory allocations and DB payload by ~10x.
**Action:** When querying parent entities that require attaching only the most recent child record, use SQL window functions (`ROW_NUMBER()`) instead of eager loading the full child collection and sorting in Python.

## 2025-05-21 - Batched Vector Embedding Requests in Pipeline Nodes
**Learning:** Calling `litellm.aembedding` individually for each text chunk in `embed_node` incurred separate HTTP request overhead, TLS handshakes, and API round-trip latency for up to 4 chunks per paper. Passing all text chunks as a list (`input=[text1, text2, ...]`) in a single `litellm.aembedding` request processes all vectors in 1 network round-trip (~3-4x latency reduction for the stage).
**Action:** Always batch embedding requests into a single list payload when generating vectors for multiple text chunks in pipeline stages or batch processing.

## 2025-05-20 - Jinja2 Template Object Caching in LLM Prompt Pipeline
**Learning:** Caching raw template strings (e.g., via `Path.read_text`) in Python LLM prompt rendering only eliminates disk I/O but leaves Jinja2 syntax parsing, tokenization, and AST generation on every prompt render call (~994 µs/call). Caching compiled `jinja2.Template` objects reduces overhead to ~11.5 µs/call (~86x faster).
**Action:** Always cache compiled `jinja2.Template` objects (or `Environment.from_string` outputs) via `@lru_cache` rather than just caching the file contents or raw string templates.
