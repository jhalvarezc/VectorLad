## 2024-06-16 - Add keyboard accessibility to vector selection dock
**Learning:** The application has a dock where users can select vectors for operations. These vectors are div elements with `onClick` handlers but lack keyboard accessibility (tabIndex, role, and keydown handlers) or focus indicators.
**Action:** Always verify that custom interactive elements (`div` or `span` with `onClick`) have `role="button"`, `tabIndex={0}`, keyboard handlers (Enter/Space), and visible focus states (`focus-visible:ring`).

## 2024-06-16 - Add keyboard accessibility to vector selection dock
**Learning:** The application has a dock where users can select vectors for operations. These vectors are div elements with `onClick` handlers but lack keyboard accessibility (tabIndex, role, and keydown handlers) or focus indicators.
**Action:** Always verify that custom interactive elements (`div` or `span` with `onClick`) have `role="button"`, `tabIndex={0}`, keyboard handlers (Enter/Space), and visible focus states (`focus-visible:ring`).
