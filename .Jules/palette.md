## 2024-06-14 - Interactive Icon Components and Form Labels
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.

## 2024-06-25 - Interactive Cards and Hover-Revealed Buttons
**Learning:** Attempted to make interactive cards accessible via keyboard by adding `role="button"`, `tabIndex={0}`, and `onKeyDown` to a `div` containing a nested delete button. This created two critical issues: 1) Event bubbling caused the parent `onKeyDown` to hijack the nested button's keyboard events (making deletion via keyboard impossible), and 2) having an interactive element (button) inside a `role="button"` violates ARIA standards and breaks screen readers.
**Action:** Use a "hidden layer" button pattern for interactive cards. Make the card a `role="group"`, position an absolute transparent `<button>` for the card's main action over the whole area (z-index 10), and place nested buttons on top (z-index 20) with `e.stopPropagation()` on their clicks.
