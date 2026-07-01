## 2024-06-14 - Interactive Icon Components and Form Labels
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.

## 2024-07-01 - Accessible Interactive Cards with Layered Button Pattern
**Learning:** Attaching onClick to a `<div>` containing nested action buttons creates an inaccessible experience for keyboard users and screen readers. However, nesting a `<button>` inside another element with `role="button"` or an outer `<button>` violates ARIA rules. Hover-revealed buttons can also be invisible to keyboard users.
**Action:** Use the "layered button" pattern for interactive cards. Give the parent container `role="group"`. Add an absolutely positioned, transparent `<button>` covering the card as the primary action. Apply `pointer-events-none` to inner decorative elements to prevent click interception, and place secondary nested actions (like delete) on top with a higher `z-index`, `stopPropagation()`, and `focus-visible:opacity-100` so they are accessible during keyboard navigation.
