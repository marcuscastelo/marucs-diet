# Domain Error Classes

This directory contains custom error classes for domain invariants and business rules across all domain modules.

## Error Hierarchy

- **DomainError**: Base class for all domain errors
  - **ValidationError**: Schema validation and format validation errors
  - **BusinessRuleError**: Domain logic constraints and business rule violations
  - **InvariantError**: Consistency constraints and invariant violations

## Design Principles

1. **Domain Purity**: All error classes are pure domain objects with no side effects
2. **Meaningful Messages**: Error messages are in Portuguese for user-facing scenarios
3. **Structured Context**: Each error includes machine-readable error codes and context data
4. **Type Safety**: Errors use specific types for better error handling in application layer

## Usage Pattern

```typescript
// In domain code
export function validateFoodName(name: string): void {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new FoodInvalidNameError(name)
  }
}

// In application code
try {
  validateFoodName(inputName)
} catch (error) {
  if (error instanceof FoodInvalidNameError) {
    handleApiError(error)
  }
  throw error
}
```

## Error Classes by Domain

### Food Domain
- `FoodInvalidNameError`: Invalid food name validation
- `FoodInvalidMacrosError`: Invalid macro nutrients  
- `FoodInvalidEanError`: Invalid EAN code format
- `FoodNegativeMacrosError`: Negative macro values
- `FoodDuplicateEanError`: Duplicate EAN code
- `FoodPromotionError`: Food promotion failures

### Recipe Domain
- `RecipeInvalidNameError`: Invalid recipe name
- `RecipeInvalidItemsError`: Invalid recipe items
- `RecipeEmptyItemsError`: Empty recipe
- `RecipeCircularDependencyError`: Circular dependencies
- `RecipeInvalidMultiplierError`: Invalid multiplier

### Day Diet Domain
- `DayDietInvalidTargetDayError`: Invalid target day
- `DayDietMealNotFoundError`: Meal not found
- `DayDietDuplicateMealError`: Duplicate meal IDs
- `DayDietMaxMealsExceededError`: Too many meals

### Macro Profile Domain
- `MacroProfileInvalidOwnerError`: Invalid owner
- `MacroProfileNegativeValuesError`: Negative macro values
- `MacroProfileUnrealisticValuesError`: Unrealistic macro ratios

### User Domain
- `UserInvalidNameError`: Invalid user name
- `UserInvalidAgeError`: Invalid calculated age
- `UserUnrealisticDesiredWeightError`: Unrealistic weight goals

### Weight Domain
- `WeightInvalidValueError`: Invalid weight value
- `WeightUnrealisticValueError`: Unrealistic weight
- `WeightDrasticChangeError`: Too drastic weight changes

### Measure Domain  
- `MeasureInvalidHeightError`: Invalid height
- `MeasureUnrealisticValueError`: Unrealistic measurements
- `MeasureInconsistentProportionsError`: Inconsistent proportions

### Recent Food Domain
- `RecentFoodInvalidTypeError`: Invalid type
- `RecentFoodReferenceNotFoundError`: Reference not found
- `RecentFoodLimitExceededError`: Too many recent foods

### Item Group Domain
- `ItemGroupEmptyError`: Empty item group
- `ItemGroupDuplicateItemsError`: Duplicate items
- `ItemGroupCircularDependencyError`: Circular dependencies

### Meal Domain
- `MealInvalidNameError`: Invalid meal name
- `MealEmptyError`: Empty meal
- `MealDuplicateItemsError`: Duplicate items in meal

### Macro Nutrients Domain
- `MacroNutrientsNegativeValuesError`: Negative values
- `MacroNutrientsUnrealisticRatiosError`: Unrealistic ratios
- `MacroNutrientsExcessiveValuesError`: Excessive values

## Implementation Notes

- Error classes follow naming convention: `<Entity><ErrorType>Error`
- All errors extend appropriate base classes (ValidationError, BusinessRuleError, InvariantError)
- Error codes follow pattern: `<DOMAIN>_<ERROR_TYPE>`
- Context data is provided for debugging and error handling
- Messages are in Portuguese for user-facing errors
- JSDoc is provided for all exported error classes
