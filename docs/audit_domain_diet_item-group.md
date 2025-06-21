# Diet Domain Audit – Item-Group Submodule

_Last updated: 2025-06-19_

## Overview
This audit reviews the `item-group` submodule within the diet domain, focusing on DDD adherence, modularity, and architectural issues. It covers domain logic, schema usage, error handling, and test coverage.

## Migration to Unified System (Completed)
**Major architectural change completed:** All legacy item-group view/edit components (`ItemGroupView`, related wrappers, and context providers) have been migrated to the unified system. The migration:
- Eliminated separate item-group specific UI components
- Unified item and group handling through the same presentation layer (`UnifiedItemView`, `UnifiedItemEditModal`)
- Removed duplicate validation and state management logic between item and group components
- Simplified conversion through consistent utilities (`itemGroupToUnifiedItem`)
- All item-group functionality now flows through the unified system with appropriate type conversions

## Key Findings
- **ID Generation in Domain:** `itemGroup.ts` uses `generateId` from `~/legacy/utils/idUtils`, which is a side effect and breaks DDD purity. ID generation should be moved to infrastructure or application.
- **Schema/Type Logic:** Zod schemas are used for validation and transformation, but transformation logic (e.g., setting `__type`) could be isolated for clarity. There are TODOs for recursive schemas and future-proofing discriminated unions.
- **Repository Interface:** The domain does not define a repository interface for item-groups, which may limit testability and abstraction.
- **Error Handling:** No direct use of `handleApiError` in domain, which is correct. However, there are no custom error classes for domain invariants or business rules.
- **Test Coverage:** There is a test file for item-group operations, but coverage of invariants and edge cases should be reviewed.

## Urgency
- **High:** Remove all ID generation and legacy utility usage from domain code.
- **Medium:** Define a repository interface for item-groups in the domain layer.
- **Low:** Refactor transformation logic for clarity and add custom error classes for domain rules.

## Next Steps
- [ ] Refactor ID generation to infrastructure/application.
- [ ] Audit all domain files for legacy/shared utility imports.
- [ ] Define and document an `ItemGroupRepository` interface in the domain.
- [ ] Add and document custom error types for domain invariants.
- [ ] Review and improve test coverage for item-group domain logic.

## Future Refinement Suggestions
- Expand audit to cover cross-module dependencies (e.g., meal, recipe).
- Review Zod schema usage for separation of validation vs. transformation.
- Propose stricter contracts for domain operations and invariants.
- Monitor unified system performance and consider optimizations for group-specific operations.
