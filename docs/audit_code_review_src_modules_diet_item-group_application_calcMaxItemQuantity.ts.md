# Audit: src/modules/diet/item-group/application/calcMaxItemQuantity.ts

## Summary of Changes
- New application-layer utility to calculate the maximum allowed quantity for a food item based on macro targets.
- Uses a safety margin to avoid overfilling macros.

## Strengths
- Follows clean architecture and static import conventions.
- Provides a clear, testable utility for macro-based quantity calculation.
- Improves user experience by preventing macro overages.

## Issues/Concerns
- Ensure macro target and item macro calculations are robust and up to date.
- Test coverage for edge cases and different macro targets should be maintained.

## Recommendations
- Periodically review for accuracy and alignment with domain logic.
- Document any changes to macro target logic that may affect this utility.
