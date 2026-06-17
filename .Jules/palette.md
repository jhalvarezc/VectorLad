## 2024-06-03 - Vector Selection Cards Accessibility Focus
**Learning:** In a heavily 3D/canvas-driven app, floating UI overlays (like vector selection lists) often use `div` elements for click handlers to look like a dock, but lack keyboard support. Screen readers miss them entirely.
**Action:** Always add `role="button"`, `tabIndex={0}`, `onKeyDown` handlers (for Enter/Space), and `focus-visible` styles to any floating `div` used for selection/interaction to make it inclusive.
