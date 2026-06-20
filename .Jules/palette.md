## 2024-06-14 - Interactive Icon Components and Form Labels
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.

## 2024-05-14 - Keyboard Accessibility in Interactive Cards
**Learning:** When building interactive cards (like the vector list items) that contain nested interactive elements (like a delete button), using a standard `<button>` for the outer card creates invalid HTML and accessibility issues (nested interactive elements). Relying only on `onClick` on a `<div>` breaks keyboard navigation.
**Action:** Use a generic container with `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler (listening for `Enter` and `Space`). For nested actions (like delete) that appear only on hover, ensure they have `focus-visible:opacity-100` so they become visible when tabbed to via keyboard.
