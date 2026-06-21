## 2024-06-14 - Interactive Icon Components and Form Labels
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.
## 2026-06-21 - Nested Interactive Element Pattern
**Learning:** When building complex list items (like the vector cards) that are themselves interactive but contain nested interactive elements (like a delete button), wrapping everything in a `<button>` creates invalid HTML and accessibility issues.
**Action:** Use a `<div role="button" tabIndex={0}>` with an `onKeyDown` handler for the outer card container to ensure proper keyboard accessibility without violating HTML nesting rules. Additionally, ensure nested buttons have explicit `focus-visible` styles so they are discoverable by keyboard navigation.
