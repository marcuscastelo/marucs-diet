# Sections Audit – Weight Section

_Last updated: 2025-06-07_

## Overview
This audit reviews the `weight` section UI components, focusing on separation of concerns, code duplication, and DDD alignment.

## Key Findings
- **Business Logic Leakage:** Components (e.g., `WeightEvolution`) directly use legacy utilities and perform calculations (weight progress, first/latest weight) in the UI layer, rather than delegating to the application layer.
- **Legacy Utility Usage:** UI components import legacy utilities (e.g., `weightUtils`), which should be abstracted away.
- **Component Boundaries:** Components are generally well-structured, but some state and calculation logic could be moved to hooks or the application layer for clarity and testability.
- **Duplication:** Some chart and calculation logic may be duplicated across weight and other sections (e.g., profile, macro-nutrients).

## Urgency
- **High:** Move business logic (calculations, weight state) out of UI components and into the application layer or custom hooks.
- **Medium:** Refactor legacy utility usage to use application/domain abstractions.
- **Low:** Review and clarify component boundaries and prop drilling.

## Next Steps
- [ ] Refactor business logic into application layer or custom hooks.
- [ ] Replace legacy utility usage with application/domain abstractions.
- [ ] Audit all weight section components for business logic leakage and duplication.
- [ ] Review and improve test coverage for UI logic.

## Future Refinement Suggestions
- Consider unifying chart and calculation logic if used in multiple sections.
- Expand audit to cover context usage and state management patterns.
- Propose stricter boundaries between UI, application, and domain layers.
