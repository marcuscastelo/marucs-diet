# Audit: src/modules/diet/item-group/tests/itemGroupUtils.test.ts

## Summary of Changes
- New test file added for item group utilities: getTopContributors, calcMaxItemQuantity, and applyItemEdit.
- Provides deterministic and real function tests for ranking, value calculation, and edit application.

## Strengths
- Improves test coverage for new and existing item group utilities.
- Uses static imports and type-safe mocks in line with project conventions.
- Covers main behaviors and edge cases for macro contributor logic.

## Issues/Concerns
- Ensure all new and existing utilities are covered as the logic evolves.
- Test file may need to be updated if ranking or edit logic changes.

## Recommendations
- Periodically review and expand test coverage as new features are added.
- Maintain alignment with domain model and macro contributor logic.
