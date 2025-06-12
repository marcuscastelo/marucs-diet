# Sections Audit – Food-Item Section

_Last updated: 2025-06-07_

## Overview
This audit reviews the `food-item` section UI components, focusing on separation of concerns, code duplication, and DDD alignment.

## Key Findings
- **Business Logic Leakage:** Components (e.g., `ItemEditModal`) may handle validation, macro overflow, and item state logic directly in the UI, rather than delegating to the application layer.
- **Legacy Utility Usage:** Some components may use legacy or shared utilities for calculations or state, which should be abstracted away.
- **Component Boundaries:** Components are generally well-structured, but some state and calculation logic could be moved to hooks or the application layer for clarity and testability.
- **Duplication:** Some item editing and validation logic may be duplicated across food-item and other sections (e.g., item-group, meal).

## Urgency
- **High:** Move business logic (validation, macro overflow, item state) out of UI components and into the application layer or custom hooks.
- **Medium:** Refactor legacy utility usage to use application/domain abstractions.
- **Low:** Review and clarify component boundaries and prop drilling.

## Next Steps
- [ ] Refactor business logic into application layer or custom hooks.
- [ ] Replace legacy utility usage with application/domain abstractions.
- [ ] Audit all food-item section components for business logic leakage and duplication.
- [ ] Review and improve test coverage for UI logic.

## Future Refinement Suggestions
- Consider unifying item editing and validation logic if used in multiple sections.
- Expand audit to cover context usage and state management patterns.
- Propose stricter boundaries between UI, application, and domain layers.
