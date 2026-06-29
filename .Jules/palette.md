## 2024-05-18 - Missing ARIA Labels and IDs
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.

## 2024-05-18 - Nested Hover-Action Accessibility Pattern
**Learning:** Hover-revealed nested elements (like absolutely positioned delete buttons on a card) remain invisible to keyboard users and violate ARIA rules if placed inside a container acting as a button (e.g. div with onClick).
**Action:** Use the 'layered button' pattern: assign `role="group"` to the parent container, use an absolutely-positioned transparent `<button>` overlay for the primary action, apply `pointer-events-none` to inner decorative elements to prevent click interception, and place nested actions on top with a higher z-index and `stopPropagation()`. Add `focus-visible:opacity-100` and focus ring styles to the nested button to ensure it becomes visible and usable during keyboard navigation.
