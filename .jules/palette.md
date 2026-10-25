## 2025-05-18 - Accessible Icon-Only Buttons
**Learning:** `title` attributes on icon-only buttons provide visual tooltips on hover, but assistive technologies (screen readers) rely on `aria-label` to announce button purposes accurately without relying on browser hover tooltips or child icon SVGs.
**Action:** Always include an explicit `aria-label` along with any visual `title` attribute on `size="icon"` or icon-only buttons across components.
