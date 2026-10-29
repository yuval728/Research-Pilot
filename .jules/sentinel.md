## 2025-10-29 - Prevent Token Leakage via URL Query Parameters
**Vulnerability:** Accepting authentication JWTs in URL query parameters (`?token=...`). Query parameters are routinely logged in web server logs, proxy access logs, browser history, and `Referer` headers.
**Learning:** `get_current_user` in `pipeline/src/api/dependencies.py` allowed a `token` query parameter fallback alongside HTTP Bearer tokens.
**Prevention:** Enforce standard `Authorization: Bearer <token>` HTTP header authentication for all endpoints and reject tokens passed via query strings.
