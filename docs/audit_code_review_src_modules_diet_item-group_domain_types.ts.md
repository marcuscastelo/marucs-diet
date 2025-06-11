# Audit: src/modules/diet/item-group/domain/types.ts

## Summary of Changes
- New domain type `MacroContributorEntry` added for macro contributor UI and application logic.
- Documents item and handleApply function for integration.

## Strengths
- Improves type safety and clarity for macro contributor workflows.
- Follows static import and JSDoc conventions.

## Issues/Concerns
- Ensure all usages of macro contributor entries are updated to use this type.
- Maintain JSDoc accuracy as the type evolves.

## Recommendations
- Periodically review type usage and documentation for alignment with application needs.
- Expand or refine the type as new macro contributor features are added.
