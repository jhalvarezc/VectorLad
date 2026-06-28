## 2024-06-14 - Interactive Icon Components and Form Labels
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.
## 2024-06-28 - Layered Button Pattern for Interactive Cards
**Learning:** Nesting interactive elements (like a delete button) inside an element with an `onClick` handler or `role="button"` violates ARIA rules and creates issues for screen readers. Additionally, hover-revealed actions are inaccessible to keyboard navigation if they don't have `focus-visible:opacity-100`.
**Action:** Apply the 'layered button' pattern for interactive cards. Make the card wrapper `role="group"`, place a transparent `absolute inset-0` button to handle the primary click, set `pointer-events-none` on non-interactive inner content, and place secondary buttons on top with higher z-index, `stopPropagation()`, and focus styles (`focus-visible:opacity-100`).
