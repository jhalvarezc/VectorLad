## 2024-06-14 - Interactive Icon Components and Form Labels
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.

## 2026-06-18 - Keyboard Accessibility for Custom Interactive Elements
**Learning:** Found custom `div` elements acting as buttons (vector cards in dock) that lacked keyboard support and focus visibility, making them completely inaccessible to keyboard users. Internal actionable elements (like delete buttons inside a card) were also only visible on mouse hover.
**Action:** When using `div`s as interactive elements, always ensure they have `role="button"`, `tabIndex={0}`, `onKeyDown` support (for Enter/Space), and clear focus indicators (`focus-visible`). For nested actionable elements inside custom cards, use `group-focus-within` to reveal them when the card or its contents receive focus.
