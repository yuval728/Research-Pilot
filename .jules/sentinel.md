# Sentinel's Security Journal

## 2025-05-24 - Mermaid strict securityLevel prevents XSS via dangerouslySetInnerHTML
**Vulnerability:** Mermaid diagrams generated from paper pipelines or user data were rendered into the DOM using `dangerouslySetInnerHTML={{ __html: svg }}`. In `app/src/lib/mermaid.ts`, Mermaid was initialized with `securityLevel: 'loose'`, which allows script tags and click callback execution embedded in diagram syntax.
**Learning:** Initializing Mermaid with `securityLevel: 'loose'` disables built-in SVG sanitization and tag filtering, creating a Stored/DOM XSS vector when untrusted or AI-generated paper diagram definitions are displayed in viewer components.
**Prevention:** Always configure `securityLevel: 'strict'` when initializing Mermaid, ensuring scripts and interactive event handlers are stripped during diagram SVG rendering before injection into the DOM.
