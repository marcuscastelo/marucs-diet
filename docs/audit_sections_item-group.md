# Sections Audit – Item-Group Section

_Last updated: 2025-06-07_

## Overview
This audit reviews the `item-group` section UI components, focusing on separation of concerns, code duplication, and DDD alignment.

## Key Findings
- **Duplication:** Some logic (e.g., clipboard, schema validation, ID regeneration) is duplicated across item-group and other edit modals (e.g., meal, recipe).
- **Business Logic Leakage:** Domain logic (e.g., group operations, ID regeneration, overflow checks) is handled directly in the UI, rather than being delegated to the application layer.
- **Legacy Utility Usage:** UI components import legacy utilities (e.g., `regenerateId`, `deepCopy`, `macroOverflow`), which should be abstracted away.
- **Component Boundaries:** The modal/component pattern is used, but some state and effect management could be further isolated or moved to hooks.

## Urgency
- **High:** Refactor duplicated clipboard and schema logic into shared hooks or utilities.
- **Medium:** Move business logic (ID regeneration, group operations, overflow checks) out of UI components.
- **Low:** Review and clarify component boundaries and state management.

## Next Steps
- [ ] Extract clipboard and schema logic into shared hooks/utilities.
- [ ] Refactor business logic into application layer or custom hooks.
- [ ] Audit all item-group section components for business logic leakage.
- [ ] Review and improve test coverage for UI logic.

## Future Refinement Suggestions
- Consider unifying edit modals/views if their logic is highly similar.
- Expand audit to cover context usage and state management patterns.
- Propose stricter boundaries between UI, application, and domain layers.
