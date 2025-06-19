# Sections Audit – Day-Diet Section

_Last updated: 2025-06-19_

## Overview
This audit reviews the `day-diet` section UI components, focusing on separation of concerns, code duplication, and DDD alignment.

## Impact of Unified System Migration
**Indirect benefits from unified system:** While the day-diet section doesn't directly use item view components, it benefits from the overall architectural improvements:
- **Reduced Complexity:** The unified system migration has reduced overall codebase complexity, making day-diet components easier to maintain
- **Consistent Patterns:** The unified approach provides better patterns for component organization and business logic separation
- **Shared Infrastructure:** Improved shared component organization benefits day-diet section components

## Key Findings
- **Business Logic Leakage:** Components (e.g., `DayMacros`) directly use legacy utilities and perform calculations (macros, calories, macro targets) in the UI layer, rather than delegating to the application layer.
- **Legacy Utility Usage:** UI components import legacy utilities (e.g., `macroMath`), which should be abstracted away.
- **Component Boundaries:** Components are generally well-structured, but some state and calculation logic could be moved to hooks or the application layer for clarity and testability.
- **Duplication:** Some calculation and progress logic may be duplicated across day-diet and other sections (e.g., profile, macro-nutrients).

## Urgency
- **High:** Move business logic (calculations, macro state) out of UI components and into the application layer or custom hooks.
- **Medium:** Refactor legacy utility usage to use application/domain abstractions.
- **Low:** Review and clarify component boundaries and prop drilling.

## Next Steps
- [ ] Refactor business logic into application layer or custom hooks.
- [ ] Replace legacy utility usage with application/domain abstractions.
- [ ] Audit all day-diet section components for business logic leakage and duplication.
- [ ] Review and improve test coverage for UI logic.

## Future Refinement Suggestions
- Consider applying unified system patterns to calculation and progress logic if used in multiple sections.
- Expand audit to cover context usage and state management patterns.
- Propose stricter boundaries between UI, application, and domain layers following the unified system example.
