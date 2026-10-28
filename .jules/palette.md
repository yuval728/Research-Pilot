## 2025-03-30 - Icon-Only Action Buttons Missing Accessible Names
**Learning:** In this design system, `<Button size="icon">` components wrap Lucide icons without accessible text. Screen readers cannot announce their purpose unless an explicit `aria-label` is provided alongside any `title` tooltips.
**Action:** When adding or auditing icon-only buttons (`size="icon"`), always include an explicit `aria-label` matching or complementing the `title` attribute.
