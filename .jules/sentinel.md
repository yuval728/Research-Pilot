## 2025-05-18 - Enforcing Upload File Size Limits in FastAPI

**Vulnerability:** Unbounded file reading (`await file.read()`) in file upload endpoints allowed attackers to exhaust server memory (DoS) by uploading oversized payloads.

**Learning:** Checking `len(file_bytes)` after calling `await file.read()` is ineffective against memory exhaustion because the entire file payload is loaded into RAM before validation. Furthermore, Starlette's `file.size` metadata may be `None` depending on backend client headers.

**Prevention:** Check `file.size` if present, and restrict `await file.read(max_size + 1)` to bound memory usage to `max_size + 1` bytes before validating size and returning HTTP 413 Payload Too Large.
