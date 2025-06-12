# Sections Audit – Recipe Section

_Last updated: 2025-06-07_

## Overview
This audit reviews the `recipe` section UI components, focusing on separation of concerns, code duplication, and DDD alignment.

## Key Findings
- **Duplication:** Clipboard logic, schema validation, and group conversion logic are duplicated between `RecipeEditView` and other edit views (e.g., MealEditView).
- **Business Logic Leakage:** Some domain logic (e.g., item/group operations, ID regeneration) is handled directly in the UI, rather than being delegated to the application layer.
- **Legacy Utility Usage:** UI components import legacy utilities (e.g., `regenerateId`), which should be abstracted away.
- **Component Boundaries:** The context/provider pattern is used, but some props and state management could be further isolated.

## Urgency
- **High:** Refactor duplicated clipboard and schema logic into shared hooks or utilities.
- **Medium:** Move business logic (ID regeneration, group/item operations) out of UI components.
- **Low:** Review and clarify component boundaries and prop drilling.

## Next Steps
- [ ] Extract clipboard and schema logic into shared hooks/utilities.
- [ ] Refactor business logic into application layer or custom hooks.
- [ ] Audit all recipe section components for business logic leakage.
- [ ] Review and improve test coverage for UI logic.

## Future Refinement Suggestions
- Consider unifying edit views (recipe, meal) if their logic is highly similar.
- Expand audit to cover context usage and state management patterns.
- Propose stricter boundaries between UI, application, and domain layers.
