## 2024-06-14 - Interactive Icon Components and Form Labels
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.

## 2026-06-30 - Accessible Interactive Cards with Nested Actions
**Learning:** Implementing interactive cards with nested actions (like a delete button) can violate ARIA rules if a <button> is nested inside a role="button". Additionally, hover-revealed actions are inaccessible to keyboard users unless explicitly styled for focus.
**Action:** Use the 'layered button' pattern: assign `role="group"` to the card, add an absolutely-positioned transparent `<button>` overlay for the primary action, apply `pointer-events-none` to inner decorative text to prevent click interception, and place nested interactive buttons on top with a higher z-index, `stopPropagation()`, and `focus-visible:opacity-100` along with focus styles so they become visible during keyboard navigation.
