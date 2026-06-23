## 2024-06-14 - Interactive Icon Components and Form Labels
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.

## 2026-06-23 - Interactive Div Elements Keyboard Accessibility
**Learning:** Found interactive elements (vector cards) implemented as `div` tags with `onClick` handlers but lacking keyboard support and focus states, making them inaccessible to keyboard users.
**Action:** When implementing custom interactive elements using `div` tags, always include `role="button"`, `tabIndex={0}`, an `onKeyDown` handler (for Enter/Space), and `focus-visible` styling to ensure proper keyboard accessibility.
