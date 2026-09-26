# Bolt's Performance Journal

## 2025-05-20 - Jinja2 Template Object Caching in LLM Prompt Pipeline
**Learning:** Caching raw template strings (e.g., via `Path.read_text`) in Python LLM prompt rendering only eliminates disk I/O but leaves Jinja2 syntax parsing, tokenization, and AST generation on every prompt render call (~994 µs/call). Caching compiled `jinja2.Template` objects reduces overhead to ~11.5 µs/call (~86x faster).
**Action:** Always cache compiled `jinja2.Template` objects (or `Environment.from_string` outputs) via `@lru_cache` rather than just caching the file contents or raw string templates.
