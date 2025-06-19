# Sections Audit – Profile Section

_Last updated: 2025-06-19_

## Overview
This audit reviews the `profile` section UI components, focusing on separation of concerns, code duplication, and DDD alignment.

## Impact of Unified System Migration
**Indirect benefits from unified system:** While the profile section doesn't directly use item view components, it benefits from the overall architectural improvements:
- **Reduced Complexity:** The unified system migration has reduced overall codebase complexity, making profile components easier to maintain
- **Consistent Patterns:** The unified approach provides better patterns for component organization and business logic separation
- **Shared Infrastructure:** Improved shared component organization and button relocations benefit profile section components

## Key Findings
- **Business Logic Leakage:** Several components (e.g., `MacroEvolution`) directly use legacy utilities and perform calculations (macros, calories, weight) in the UI layer, rather than delegating to the application layer.
- **Legacy Utility Usage:** UI components import legacy utilities (e.g., `macroMath`, `macroProfileUtils`, `weightUtils`), which should be abstracted away.
- **Component Boundaries:** Components are generally well-structured, but some state and calculation logic could be moved to hooks or the application layer for clarity and testability.
- **Duplication:** Some chart and calculation logic may be duplicated across profile and other sections (e.g., weight, macro-nutrients).

## Urgency
- **High:** Move business logic (calculations, profile state) out of UI components and into the application layer or custom hooks.
- **Medium:** Refactor legacy utility usage to use application/domain abstractions.
- **Low:** Review and clarify component boundaries and prop drilling.

## Next Steps
- [ ] Refactor business logic into application layer or custom hooks.
- [ ] Replace legacy utility usage with application/domain abstractions.
- [ ] Audit all profile section components for business logic leakage and duplication.
- [ ] Review and improve test coverage for UI logic.

## Future Refinement Suggestions
- Consider applying unified system patterns to chart and calculation logic if used in multiple sections.
- Expand audit to cover context usage and state management patterns.
- Propose stricter boundaries between UI, application, and domain layers following the unified system example.
