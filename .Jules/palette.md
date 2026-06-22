## 2024-06-14 - Interactive Icon Components and Form Labels
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.

## 2024-06-22 - Divs as Buttons in Lists
**Learning:** Interactive `<div>` elements used as cards in horizontal scrollable lists are missing keyboard accessibility (`role="button"`, `tabIndex={0}`, and `onKeyDown`). Additionally, absolute-positioned action buttons inside these cards (e.g., delete buttons) that use `opacity-0 group-hover:opacity-100` are inaccessible via keyboard navigation because they lack `focus-visible` styles to reveal them on focus.
**Action:** When creating interactive lists or cards using divs, explicitly implement `role="button"`, tab indexing, and keyboard event handlers. Ensure any hover-revealed action buttons inside these cards use `focus-visible:opacity-100` and focus rings so they become visible when a keyboard user tabs to them.
