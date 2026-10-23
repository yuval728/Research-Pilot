## 2025-05-18 - Accessible Names for Icon-Only Buttons and Inputs
**Learning:** Components using Radix/Lucide icons with `size="icon"` or standalone `<Input>` components frequently rely solely on visual placeholders or `title` tooltips, leaving them without accessible names for screen readers (`aria-label`).
**Action:** Always include explicit `aria-label` attributes on icon-only buttons and form inputs that lack explicit `<label>` tags.
