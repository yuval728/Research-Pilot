## 2025-05-15 - Mermaid Diagram XSS Vulnerability
**Vulnerability:** Mermaid.js was initialized with `securityLevel: 'loose'`, allowing arbitrary HTML tags and script execution when rendering SVG diagrams via `dangerouslySetInnerHTML`.
**Learning:** Rendering user- or AI-generated diagram DSL code with `securityLevel: 'loose'` allows execution of inline JavaScript in the user's session.
**Prevention:** Always set `securityLevel: 'strict'` or `'antiscript'` when configuring Mermaid.js in frontend components.
