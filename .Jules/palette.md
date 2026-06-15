## 2024-06-14 - Interactive Icon Components and Form Labels
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.

## 2024-06-15 - Contextual Guidance and Destructive Actions
**Learning:** Found an empty state lacking direction, disabled operation buttons without clear explanations, and a destructive clear button without confirmation.
**Action:** Enhance empty states with clear calls-to-action. Provide visible contextual text for disabled buttons instead of relying purely on hover tooltips. Always wrap destructive UI actions with a confirmation dialog.
