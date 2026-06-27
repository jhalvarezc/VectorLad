## 2024-06-14 - Interactive Icon Components and Form Labels
**Learning:** Found multiple unlabelled icon buttons and dynamically mapped inputs without clear ID references.
**Action:** Always map inputs directly with htmlFor/id. Wrap SVGs in buttons with aria-hidden=true and add localized text tooltips and ARIA labels for context.

## 2024-10-24 - Layered Button Pattern and Hover-Revealed Keyboard Accessibility
**Learning:** Adding `onClick` to a container `div` that contains other interactive elements (like a delete button) creates an inaccessible nested interaction pattern that screen readers struggle with, and hover-revealed elements are completely hidden from keyboard users without explicit focus styles.
**Action:** Use the "layered button" pattern for interactive cards: `role="group"` on the container, an absolute-positioned transparent `<button>` overlay for the primary action, and nested actions on top with higher z-index and `focus-visible:opacity-100` to ensure they become visible and usable during keyboard navigation.
