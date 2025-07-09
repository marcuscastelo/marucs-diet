# Test Documentation Framework

## Testing Strategy Overview

Macroflows uses a comprehensive testing strategy with Vitest and jsdom for unit and integration tests. Tests are organized by module and layer, following the clean architecture pattern.

## Test Organization Structure

### 1. **Test Location Patterns**
- **Module tests**: `src/modules/{module}/tests/` or alongside source files with `.test.ts` suffix
- **Domain tests**: Focus on business logic validation and error handling
- **Application tests**: Test SolidJS resources, state management, and orchestration
- **Infrastructure tests**: Test database operations, migrations, and external integrations

### 2. **Test Types by Layer**

#### Domain Layer Tests
- **Focus**: Pure business logic, validation, and domain operations
- **Examples**:
  - `dayDietOperations.test.ts` - Day diet business logic
  - `recipeOperations.test.ts` - Recipe scaling and operations
  - `itemGroupOperations.test.ts` - Item group management
  - `mealOperations.test.ts` - Meal operations
- **Patterns**: Pure function testing, validation testing, error condition testing

#### Application Layer Tests
- **Focus**: SolidJS reactive state, orchestration, and error handling
- **Examples**:
  - `dayDiet.test.ts` - Day diet state management
  - `item.test.ts` - Item application services
  - `template.test.ts` - Template application services
- **Patterns**: Signal testing, effect testing, error handling validation

#### Infrastructure Layer Tests
- **Focus**: Database operations, migrations, and external API integration
- **Examples**:
  - `dayDietDAO.test.ts` - DAO conversions and legacy migration
  - `migrationUtils.test.ts` - Data migration utilities
- **Patterns**: DAO testing, migration testing, repository testing

### 3. **Specialized Test Categories**

#### Schema and Validation Tests
- **Examples**:
  - `unifiedItemSchema.test.ts` - Complex type validation
  - `validateItemHierarchy.test.ts` - Hierarchy validation
- **Focus**: Zod schema validation, type guards, data integrity

#### Utility Function Tests
- **Examples**:
  - `measureUtils.test.ts` - Measurement calculations
  - `conversionUtils.test.ts` - Type conversions
  - `treeUtils.test.ts` - Tree operations
- **Focus**: Pure utility functions, calculations, transformations

#### Error Handling Tests
- **Examples**:
  - `errorMessageHandler.test.ts` - Error message processing
  - `clipboardErrorUtils.test.ts` - Clipboard error handling
- **Focus**: Error processing, message formatting, error recovery

#### Toast System Tests
- **Examples**:
  - `toastManager.test.ts` - Toast display management
  - `toastQueue.test.ts` - Queue processing
  - `toastSettings.test.ts` - Settings management
- **Focus**: Notification system, queue management, user feedback

## Test Documentation Requirements

### 1. **Test File Documentation**
Each test file should include:
- **Purpose**: Clear description of what functionality is being tested
- **Setup**: Any required setup or mock configuration
- **Test Cases**: Comprehensive coverage of success and failure scenarios
- **Edge Cases**: Boundary conditions and error states

### 2. **Test Case Documentation**
Each test case should have:
- **Descriptive names**: Clear, action-based test descriptions
- **Given-When-Then structure**: Clear test organization
- **Expected behavior**: Explicit assertions and expectations
- **Error scenarios**: Expected error conditions and messages

### 3. **Mock and Setup Documentation**
- **Mock purposes**: Why mocks are used and what they simulate
- **Setup functions**: Reusable test setup utilities
- **Test data**: Well-structured test data factories

## Testing Standards

### 1. **Coverage Requirements**
- **Domain layer**: 100% coverage of business logic
- **Application layer**: Focus on error handling and state management
- **Infrastructure layer**: Test DAO conversions and migrations

### 2. **Test Quality Standards**
- **Isolated tests**: Each test should be independent
- **Deterministic**: Tests should produce consistent results
- **Fast execution**: Tests should run quickly
- **Clear assertions**: Explicit and meaningful assertions

### 3. **Test Maintenance**
- **Update with changes**: Tests must be updated when code changes
- **Remove orphaned tests**: Delete tests for removed functionality
- **Refactor with code**: Keep tests aligned with code structure

## Common Test Patterns

### 1. **Domain Entity Testing**
```typescript
describe('Entity Operations', () => {
  it('should create valid entity', () => {
    // Test entity creation
  })
  
  it('should validate entity constraints', () => {
    // Test validation rules
  })
  
  it('should handle invalid input', () => {
    // Test error conditions
  })
})
```

### 2. **Application State Testing**
```typescript
describe('Application State', () => {
  beforeEach(() => {
    // Setup mocks and initial state
  })
  
  it('should handle state updates', () => {
    // Test reactive state changes
  })
  
  it('should handle errors correctly', () => {
    // Test error handling and recovery
  })
})
```

### 3. **Infrastructure Testing**
```typescript
describe('Infrastructure Operations', () => {
  it('should convert DAO to entity', () => {
    // Test data conversion
  })
  
  it('should handle migration scenarios', () => {
    // Test data migrations
  })
})
```