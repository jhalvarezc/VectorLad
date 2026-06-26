## 2024-06-14 - Interactive Icon Components and Form Labels
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.

## 2024-06-15 - Layered Button Pattern for Accessible Cards
**Learning:** Found complex cards combining `onClick` on `<div>`s containing nested `<button>`s, which breaks accessibility navigation and is generally treated as invalid HTML interaction.
**Action:** Use the "layered button pattern". Assign `role="group"` to the parent card `<div>`. Implement an absolutely-positioned transparent `<button>` covering the card as the primary action (`absolute inset-0 z-0`). For secondary nested actions (like delete), ensure they sit above the overlay (`z-20`) and catch events with `stopPropagation()`. Apply `pointer-events-none z-10` to informational elements (labels, values) to prevent them from blocking clicks to the underlying primary button. Ensure hover-only buttons use `focus-visible:opacity-100` for keyboard users.
