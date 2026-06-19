## 2024-06-14 - Interactive Icon Components and Form Labels
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.

## 2024-10-24 - Interactive Selectable Elements
**Learning:** Found interactive elements (`div` tags acting as selectable vector cards) that were missing semantic roles, keyboard navigation (tabbing), and focus states. This prevents screen reader users from understanding their state or even interacting with them via keyboard.
**Action:** When creating selectable cards/items, use `role="button"` and `tabIndex={0}` on `div` elements when they contain nested interactive elements (like a delete button), add `type="button"`, manage their state using `aria-pressed`, and include `focus-visible` Tailwind classes for clear keyboard focus states. Also ensure any nested interactive elements (like delete buttons) appear properly on focus.
