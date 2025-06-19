# Sections Audit – Macro-Nutrients Section

_Last updated: 2025-06-19_

## Overview
This audit reviews the `macro-nutrients` section UI components, focusing on separation of concerns, code duplication, and DDD alignment.

## Impact of Unified System Migration
**Indirect benefits from unified system:** While the macro-nutrients section doesn't directly use item view components, it benefits from the overall architectural improvements:
- **Reduced Complexity:** The unified system migration has reduced overall codebase complexity, making macro-nutrients components easier to maintain
- **Consistent Patterns:** The unified approach provides better patterns for component organization that can be applied to macro-nutrients components
- **Shared Utilities:** Better organization of shared components (like button relocations) benefits macro-nutrients section

## Key Findings
- **Business Logic Leakage:** Components (e.g., `MacroTargets`) directly use legacy utilities and perform calculations (macro targets, calories, macro profiles) in the UI layer, rather than delegating to the application layer.
- **Legacy Utility Usage:** UI components import legacy utilities (e.g., `macroMath`, `macroProfileUtils`), which should be abstracted away.
- **Component Boundaries:** Components are generally well-structured, but some state and calculation logic could be moved to hooks or the application layer for clarity and testability.
- **Duplication:** Some calculation and macro representation logic may be duplicated across macro-nutrients and other sections (e.g., profile, day-diet).

## Urgency
- **High:** Move business logic (calculations, macro state) out of UI components and into the application layer or custom hooks.
- **Medium:** Refactor legacy utility usage to use application/domain abstractions.
- **Low:** Review and clarify component boundaries and prop drilling.

## Next Steps
- [ ] Refactor business logic into application layer or custom hooks.
- [ ] Replace legacy utility usage with application/domain abstractions.
- [ ] Audit all macro-nutrients section components for business logic leakage and duplication.
- [ ] Review and improve test coverage for UI logic.

## Future Refinement Suggestions
- Consider applying unified system patterns to macro calculation and representation logic if used in multiple sections.
- Expand audit to cover context usage and state management patterns.
- Propose stricter boundaries between UI, application, and domain layers following the unified system example.
