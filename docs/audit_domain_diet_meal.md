# Diet Domain Audit – Meal Submodule

_Last updated: 2025-06-07_

## Overview
This audit reviews the `meal` submodule within the diet domain, focusing on DDD adherence, modularity, and architectural issues. It covers domain logic, schema usage, error handling, and test coverage.

## Key Findings
- **ID Generation in Domain:** `meal.ts` uses `generateId` from `~/legacy/utils/idUtils`, which is a side effect and breaks DDD purity. ID generation should be moved to infrastructure or application.
- **Schema/Type Logic:** The Zod schema is used for validation and transformation, but transformation logic (e.g., setting `__type`) could be isolated for clarity.
- **Repository Interface:** The domain does not define a repository interface for meals, which may limit testability and abstraction.
- **Error Handling:** No direct use of `handleApiError` in domain, which is correct. However, there are no custom error classes for domain invariants or business rules.
- **Test Coverage:** There is a test file for meal operations, but coverage of invariants and edge cases should be reviewed.

## Urgency
- **High:** Remove all ID generation and legacy utility usage from domain code.
- **Medium:** Define a repository interface for meals in the domain layer.
- **Low:** Refactor transformation logic for clarity and add custom error classes for domain rules.

## Next Steps
- [ ] Refactor ID generation to infrastructure/application.
- [ ] Audit all domain files for legacy/shared utility imports.
- [ ] Define and document a `MealRepository` interface in the domain.
- [ ] Add and document custom error types for domain invariants.
- [ ] Review and improve test coverage for meal domain logic.

## Future Refinement Suggestions
- Expand audit to cover cross-module dependencies (e.g., item-group, recipe).
- Review Zod schema usage for separation of validation vs. transformation.
- Propose stricter contracts for domain operations and invariants.
