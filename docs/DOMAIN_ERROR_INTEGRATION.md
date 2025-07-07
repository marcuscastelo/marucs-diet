# DomainError Integration Guide

This guide explains how to use the enhanced error handling system with DomainError support.

## Overview

The error handling system has been enhanced to specifically handle domain errors from the `~/shared/domain/errors` module. Domain errors represent business rule violations, validation failures, and invariant breaches in the domain layer.

## Available Domain Error Types

### Base Class
```typescript
import { DomainError } from '~/shared/domain/errors'
```

### Specific Types
- `ValidationError` - For schema validation, format validation, etc.
- `BusinessRuleError` - For business logic constraints
- `InvariantError` - For consistency constraints

## Error Handlers

### `handleDomainError`
Specialized handler for domain errors that:
- Automatically determines severity based on error type
- Includes domain error code and context in logs
- Uses enhanced logging with business context

```typescript
import { handleDomainError } from '~/shared/error/errorHandler'

// Handle a domain error with enhanced context
handleDomainError(domainError, {
  operation: 'validateFood',
  entityType: 'Food',
  entityId: food.id,
  module: 'diet/food',
  component: 'foodValidator',
})
```

### Automatic Severity Assignment
- `ValidationError` → `warning`
- `BusinessRuleError` → `error`  
- `InvariantError` → `critical`

### `handleApplicationError` Enhancement
Now automatically detects and delegates domain errors:

```typescript
import { handleApplicationError } from '~/shared/error/errorHandler'

try {
  // Some operation that might throw domain or regular errors
  await validateAndSaveFood(food)
} catch (error) {
  // Automatically routes domain errors to handleDomainError
  // Routes other errors through normal application error handling
  handleApplicationError(error, context)
}
```

### `classifyAndHandleError` Enhancement
Automatically classifies and routes domain errors:

```typescript
import { classifyAndHandleError } from '~/shared/error/errorHandler'

try {
  await someOperation()
} catch (error) {
  // Automatically detects domain errors and routes them appropriately
  classifyAndHandleError(error, baseContext)
}
```

## Classification Utilities

### Domain Error Detection
```typescript
import { 
  isDomainError,
  isValidationDomainError,
  isBusinessRuleDomainError,
  isInvariantDomainError
} from '~/shared/error/errorHandler'

if (isDomainError(error)) {
  // Handle as domain error
}

if (isValidationDomainError(error)) {
  // Handle specifically as validation error
}
```

## Usage Examples

### Creating and Handling Custom Domain Errors

```typescript
// 1. Create custom domain error classes
class FoodValidationError extends ValidationError {
  constructor(message: string, field: string, value: unknown) {
    super(message, 'FOOD_VALIDATION_ERROR', { field, value })
  }
}

class FoodBusinessRuleError extends BusinessRuleError {
  constructor(message: string, ruleType: string) {
    super(message, 'FOOD_BUSINESS_RULE_ERROR', { ruleType })
  }
}

// 2. Throw domain errors in domain layer
function validateFoodNutrients(food: Food): void {
  if (food.protein < 0) {
    throw new FoodValidationError(
      'Protein cannot be negative',
      'protein',
      food.protein
    )
  }
  
  if (food.calories > 10000) {
    throw new FoodBusinessRuleError(
      'Calories exceed maximum allowed value',
      'calorie_limit'
    )
  }
}

// 3. Handle in application layer
async function saveFood(food: Food): Promise<void> {
  try {
    validateFoodNutrients(food)
    await foodRepository.save(food)
  } catch (error) {
    // Automatically handles domain errors with appropriate severity
    handleApplicationError(error, {
      operation: 'saveFood',
      entityType: 'Food',
      entityId: food.id,
      module: 'diet/food',
      component: 'foodService',
    })
    throw error
  }
}
```

### Integration with Existing Error Handling

The domain error handling integrates seamlessly with existing error handling patterns:

```typescript
// Existing pattern still works
try {
  await someOperation()
} catch (error) {
  handleApplicationError(error, context) // Now handles domain errors automatically
}

// Enhanced pattern with classification
try {
  await someOperation()
} catch (error) {
  classifyAndHandleError(error, context) // Automatically routes all error types
}
```

## Logging Output

Domain errors produce enhanced logging output:

```
2025-07-06T23:45:00.000Z [WARNING][diet/food][foodValidator::validateFood] Error: FoodValidationError: Protein cannot be negative
Entity: Food#123
Business context: { errorCode: 'FOOD_VALIDATION_ERROR', domainContext: { field: 'protein', value: -5 } }
```

## Best Practices

1. **Domain Layer**: Only throw domain errors, never handle them
2. **Application Layer**: Use `handleApplicationError` or `classifyAndHandleError`
3. **Include Context**: Always provide operation, entityType, module, and component
4. **Error Codes**: Use descriptive, consistent error codes in domain errors
5. **Context Data**: Include relevant context in domain error constructor

## Migration from Legacy Error Handling

Existing code using `handleApplicationError` will automatically benefit from domain error detection without changes. For enhanced functionality, consider using `classifyAndHandleError` for automatic error type detection.
