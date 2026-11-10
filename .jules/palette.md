# Palette's UX Journal

## 2025-05-24 - Accessible Copy-to-Clipboard with Transient Visual & Screen Reader Feedback
**Learning:** Code viewers that only offer file downloads force unnecessary context switching (downloading and opening external files in text editors). Adding a one-click copy button improves efficiency for researchers and developers copying implementation snippets. Crucially, copy actions require accessible states: updating `aria-label` dynamically (`Code copied to clipboard` vs `Copy code to clipboard`), providing transient visual state (`Check` icon and "Copied" text for 2 seconds), and emitting a toast notification for non-visual and visual confirmation.
**Action:** When adding copy actions to code or text viewers, always pair clipboard API calls with dynamic `aria-label` announcements, transient icon/text confirmation, and toast notifications.
