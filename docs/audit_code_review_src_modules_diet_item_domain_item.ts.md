# Audit: src/modules/diet/item/domain/item.ts

## Summary of Changes
- Updated JSDoc for `macros` field: now marked as @deprecated with version and alternative reference.
- Clarifies that macros should be derived from quantity and reference, and points to `foodMacros`.

## Strengths
- Improves clarity and migration guidance for deprecated fields.
- Follows JSDoc and static import conventions.

## Issues/Concerns
- Ensure all usages of the deprecated field are updated to use the new reference.
- Maintain JSDoc accuracy as the model evolves.

## Recommendations
- Periodically review domain models for deprecated fields and migration guidance.
- Remove deprecated fields when migration is complete.
