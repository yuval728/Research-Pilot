# Sentinel's Security Journal

## 2026-04-19 - Strict Security Level for Mermaid SVG Diagram Rendering
**Vulnerability:** Mermaid was initialized with `securityLevel: 'loose'` in `app/src/lib/mermaid.ts`, while rendered SVGs are directly injected into the DOM via `dangerouslySetInnerHTML` in both `DiagramViewer` and `MarkdownDiagram`. When diagram DSL contains user-controlled input (from ingested papers, LLM diagram generation, or markdown blocks), `loose` security level permits execution of inline `<script>` tags, javascript pseudo-protocols, and malicious event handlers.
**Learning:** In frontend diagram renderers like Mermaid, `securityLevel: 'loose'` disables tag sanitization and enables clickable callback handlers. When combined with React's `dangerouslySetInnerHTML`, this creates a direct path for Stored / DOM Cross-Site Scripting (XSS).
**Prevention:** Always configure `securityLevel: 'strict'` when initializing Mermaid, ensuring HTML tags are sanitized and executable click callbacks are disabled before the resulting SVG is mounted in the DOM.
