# Audit: src/modules/diet/item-group/application/getTopContributors.ts

## Summary of Changes
- New application-layer utility to return the top N items contributing to a macro (carbs, protein, or fat).
- Ranks by macro proportion, total, and density.
- Returns entries with item and handleApply function for UI integration.

## Strengths
- Follows clean architecture and static import conventions.
- Provides a robust, testable utility for macro contributor analysis.
- Supports advanced UI workflows for macro adjustment.

## Issues/Concerns
- Ensure ranking logic is robust and aligns with user expectations.
- Test coverage for different ranking scenarios should be maintained.

## Recommendations
- Periodically review ranking logic for accuracy and usability.
- Document any changes to macro contributor analysis or UI integration.
