# Audit: src/legacy/utils/macroMath.ts

## Summary of Changes
- Added `calcMacroDirection` function to normalize macro nutrients.
- No other changes detected in this diff.

## Strengths
- Improves utility for macro normalization, supporting advanced macro analysis and ranking.
- Maintains type safety and static import conventions.

## Issues/Concerns
- Ensure all usages of macro normalization are updated to use the new function.
- Test coverage for the new function should be maintained.

## Recommendations
- Periodically review macro utility functions for completeness and alignment with domain logic.
- Expand test coverage as new macro analysis features are added.
