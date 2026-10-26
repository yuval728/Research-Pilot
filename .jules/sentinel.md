## 2026-10-26 - Prevent XSS in React Markdown Rendering
**Vulnerability:** Using `rehype-raw` with `react-markdown` without HTML sanitization allowed raw unescaped HTML tags to be rendered in the DOM, introducing XSS risks.
**Learning:** `rehype-raw` parses raw HTML strings into HTML nodes within `react-markdown`. Unless `rehype-sanitize` is included or `rehype-raw` is omitted, malicious markdown content can execute scripts.
**Prevention:** Avoid `rehype-raw` unless raw HTML is strictly necessary and sanitized with `rehype-sanitize`.
