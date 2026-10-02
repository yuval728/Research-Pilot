# Bolt's Performance Journal

## 2025-05-21 - Batched Vector Embedding Requests in Pipeline Nodes
**Learning:** Calling `litellm.aembedding` individually for each text chunk in `embed_node` incurred separate HTTP request overhead, TLS handshakes, and API round-trip latency for up to 4 chunks per paper. Passing all text chunks as a list (`input=[text1, text2, ...]`) in a single `litellm.aembedding` request processes all vectors in 1 network round-trip (~3-4x latency reduction for the stage).
**Action:** Always batch embedding requests into a single list payload when generating vectors for multiple text chunks in pipeline stages or batch processing.

## 2025-05-20 - Jinja2 Template Object Caching in LLM Prompt Pipeline
**Learning:** Caching raw template strings (e.g., via `Path.read_text`) in Python LLM prompt rendering only eliminates disk I/O but leaves Jinja2 syntax parsing, tokenization, and AST generation on every prompt render call (~994 µs/call). Caching compiled `jinja2.Template` objects reduces overhead to ~11.5 µs/call (~86x faster).
**Action:** Always cache compiled `jinja2.Template` objects (or `Environment.from_string` outputs) via `@lru_cache` rather than just caching the file contents or raw string templates.
