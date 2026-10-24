## 2025-05-18 - SSE Streaming Exception Information Leakage
**Vulnerability:** Raw exception messages (`str(exc)`) were serialized into the SSE payload (`stream_run_status`) on repeated streaming errors, leaking internal exception details to clients.
**Learning:** Streaming endpoints in FastAPI/Starlette operate outside the standard global exception handler once headers are sent, so exception blocks in streaming generators must explicitly sanitize payloads.
**Prevention:** Always log exceptions server-side using structured loggers and emit standard generic error payloads to streaming clients.
