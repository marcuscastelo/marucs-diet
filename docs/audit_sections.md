# Sections/UI Layer Audit

## Overview
Sections and UI components should focus on presentation and user interaction, delegating business logic to application/domain layers.

## Findings
- **Duplication:** Notable code duplication between `MealEditView` and `RecipeEditView` (clipboard logic, schema validation, etc.).
- **Business Logic Leakage:** Some validation and orchestration logic present in UI components.
- **Naming:** Most components are well-named, but some generic names remain.

## Urgency
- **High:** Refactor duplicated logic into shared utilities or hooks.
- **Medium:** Move business logic out of UI components.

## Next Steps
- Identify all duplicated logic in sections/components.
- Propose shared abstractions for clipboard/schema logic.
- Audit all UI components for business logic leakage.

## Future Refinement Suggestions
- Create `audit_sections_<section>.md` for complex or problematic sections.
- Review UI boundaries and prop drilling.
- Analyze UI test coverage and integration with application layer.
