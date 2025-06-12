# Diet Domain Audit – Macro-Profile Submodule

_Last updated: 2025-06-07_

## Overview
This audit reviews the `macro-profile` submodule within the diet domain, focusing on DDD adherence, modularity, and architectural issues. It covers domain logic, schema usage, error handling, and test coverage.

## Key Findings
- **ID Generation:** Macro-profile domain appears to use numeric IDs, but does not directly generate them in domain code (good). Confirm that all ID generation is handled outside the domain.
- **Schema/Type Logic:** Zod schemas are used for validation and transformation. Some transformation logic (e.g., date parsing, setting `__type`) could be isolated for clarity.
- **Repository Interface:** The domain defines a `MacroProfileRepository` interface, which is good for abstraction and testability. Review for strict contracts and nullability.
- **Error Handling:** No direct use of `handleApiError` in domain, which is correct. However, there are no custom error classes for domain invariants or business rules.
- **Test Coverage:** There is a test file for macro-profile operations, but coverage of invariants and edge cases should be reviewed.

## Urgency
- **Medium:** Review and enforce strict contracts in the repository interface.
- **Low:** Refactor transformation logic for clarity and add custom error classes for domain rules.

## Next Steps
- [ ] Confirm that all ID generation is handled outside the domain.
- [ ] Review and document the `MacroProfileRepository` interface for strictness and nullability.
- [ ] Add and document custom error types for domain invariants.
- [ ] Review and improve test coverage for macro-profile domain logic.

## Future Refinement Suggestions
- Expand audit to cover cross-module dependencies (e.g., day-diet, user).
- Review Zod schema usage for separation of validation vs. transformation.
- Propose stricter contracts for domain operations and invariants.
