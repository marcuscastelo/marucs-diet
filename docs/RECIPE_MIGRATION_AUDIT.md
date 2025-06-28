reportedBy: recipe-migration-agent.v1

# Recipe Entity Migration Audit: Legacy Item[] → UnifiedItem[]

This document provides a comprehensive audit of all Recipe entity usages that need to be migrated from using legacy Item[] to UnifiedItem[] in-memory, while maintaining Item[] compatibility for database persistence.

## Migration Strategy Overview

The Recipe entity will be migrated to use UnifiedItem[] for in-memory operations while still saving to the database as Item[] (food only) for compatibility. This requires:

1. **Domain Layer Changes**: Add UnifiedItem[] support to Recipe type, mark Item[] as deprecated
2. **Operation Layer Changes**: Update all recipe operations to work with UnifiedItem[]
3. **Persistence Layer Changes**: Add conversion utilities to transform UnifiedItem[] ↔ Item[] for DB operations
4. **UI Layer Changes**: Update UI components to work natively with UnifiedItem[]
5. **Test Layer Changes**: Update tests to cover UnifiedItem[] operations and conversion logic

## Current Recipe Item[] Usage Locations

### Domain Layer

#### 1. Recipe Type Definition (`src/modules/diet/recipe/domain/recipe.ts`)
**Lines 13, 37**: Schema definitions
```typescript
// Current Issue: Uses Item[] schemas
items: itemSchema.array(),                    // Line 13 (NewRecipe)
items: itemSchema.array().readonly(),         // Line 37 (Recipe)
```

**Required Changes**:
- Add new schemas with UnifiedItem[] support
- Keep Item[] schemas for DB compatibility
- Add migration/conversion functions

#### 2. Recipe Operations (`src/modules/diet/recipe/domain/recipeOperations.ts`)
**All functions currently work with Item[]**:
- `addItemToRecipe(recipe: Recipe, item: Item): Recipe` (Line 20)
- `addItemsToRecipe(recipe: Recipe, items: readonly Item[]): Recipe` (Line 30)
- `updateItemInRecipe(recipe: Recipe, itemId: Item['id'], updatedItem: Item): Recipe` (Line 41)
- `removeItemFromRecipe(recipe: Recipe, itemId: Item['id']): Recipe` (Line 51)
- `setRecipeItems(recipe: Recipe, items: Item[]): Recipe` (Line 61)
- `clearRecipeItems(recipe: Recipe): Recipe` (Line 67)
- `findItemInRecipe(recipe: Recipe, itemId: Item['id']): Item | undefined` (Line 73)
- `scaleRecipeByPreparedQuantity()` returns `{ scaledItems: Item[]; scalingFactor: number }` (Line 127)

**Required Changes**:
- Update all operations to work with UnifiedItem[]
- Add overloads or new functions for UnifiedItem[] operations
- Keep legacy Item[] operations for backward compatibility during transition

### Infrastructure Layer

#### 3. Recipe DAO (`src/modules/diet/recipe/infrastructure/recipeDAO.ts`)
**Lines 14, 35, 46, 55, 62, 68, 74**: All DAO operations use Item[]
```typescript
items: z.array(itemSchema),           // Line 14 - Schema definition
items: [...recipe.items],             // Line 39, 50, 68, 79 - DAO conversions
```

**Required Changes**:
- Keep Item[] for database schema compatibility
- Add conversion functions to transform UnifiedItem[] → Item[] for persistence
- Add conversion functions to transform Item[] → UnifiedItem[] for loading

### Application Layer

#### 4. Recipe Service (`src/modules/diet/recipe/application/recipe.ts`)
**No direct Item[] manipulation** - delegates to domain and infrastructure.

**Required Changes**:
- Minimal changes needed, should work with updated domain layer

### UI/Sections Layer

#### 5. RecipeEditView (`src/sections/recipe/components/RecipeEditView.tsx`)
**Lines 174, 176, 206, 234, 276**: Direct usage of recipe.items
```typescript
canCopy={!hasValidPastableOnClipboard() && recipe().items.length > 0}     // Line 174
canClear={recipe().items.length > 0}                                      // Line 176
items={() => recipe().items.map(itemToUnifiedItem)}                      // Line 206
rawQuantity={recipe().items.reduce(...)}                                  // Line 234
recipe().items.reduce((acc, item) => { ... })                           // Line 276
```

**Required Changes**:
- Update to work natively with UnifiedItem[]
- Remove itemToUnifiedItem conversion (Line 206) since items will already be UnifiedItem[]
- Update operations to use UnifiedItem[] recipe operations

#### 6. GroupChildrenEditor (`src/sections/unified-item/components/GroupChildrenEditor.tsx`)
**Lines 170, 178**: Converts UnifiedItem[] to Item[] for recipe operations
```typescript
const recipeItems: Item[] = children().map(convertUnifiedItemToItem)      // Line 170
items: recipeItems,                                                       // Line 178
```

**Required Changes**:
- Remove conversion since Recipe will accept UnifiedItem[] directly
- Update to use UnifiedItem[] recipe operations

### Utilities and Related

#### 7. MacroMath (`src/shared/utils/macroMath.ts`)
**Line 32**: Uses recipe.items for macro calculations
```typescript
items: recipe.items    // Line 32
```

**Required Changes**:
- Should work transparently with UnifiedItem[] (macro calculations work on both)

#### 8. Unified Item Conversion Utils (`src/modules/diet/unified-item/domain/conversionUtils.ts`)
**Lines 93, 96, 141**: Compares UnifiedItem[] with Item[]
```typescript
const originalItems = originalRecipe.items                              // Line 93
if (recipeChildren.length !== originalItems.length) {                   // Line 96
const syncedChildren: UnifiedItem[] = originalRecipe.items.map(...)     // Line 141
```

**Required Changes**:
- Update to work with UnifiedItem[] recipe items
- Simplify conversion logic since both sides will be UnifiedItem[]

#### 9. Migration Utils (`src/modules/diet/unified-item/domain/migrationUtils.ts`)
**Line 101**: Error message about recipe.items conversion
```typescript
`migrateFromUnifiedItems: Only food children are supported in recipe.items. Found type: ${c.reference.type} (id: ${c.id})`,
```

**Required Changes**:
- Update for new UnifiedItem[] → Item[] conversion for persistence

### Tests

#### 10. Recipe Operations Tests (`src/modules/diet/recipe/domain/recipeOperations.test.ts`)
**Line 137**: Helper function creates recipes with Item[]
```typescript
const makeRecipe = (items: Item[], preparedMultiplier = 1): Recipe => {  // Line 137
```

**Multiple test assertions** use recipe.items:
- Line 249: `expect(scaledRecipe.items).toHaveLength(2)`
- Line 250: `expect(scaledRecipe.items[0]?.quantity).toBe(50)`
- Line 251: `expect(scaledRecipe.items[1]?.quantity).toBe(100)`

**Required Changes**:
- Add new tests for UnifiedItem[] operations
- Update existing tests to work with UnifiedItem[]
- Add tests for conversion utilities (UnifiedItem[] ↔ Item[])
- Keep some legacy tests for backward compatibility

## Migration Progress Status

### ✅ Completed Steps

#### Step 1: Domain Model Changes
- ✅ Added UnifiedRecipe and NewUnifiedRecipe types with UnifiedItem[] arrays
- ✅ Added schema validation for UnifiedItem[] recipes
- ✅ Created factory functions for UnifiedRecipe operations
- ✅ Maintained backward compatibility with existing Recipe/NewRecipe types

#### Step 2: Domain Operations
- ✅ Created unifiedRecipeOperations.ts with complete UnifiedItem[] recipe operations
- ✅ All operations mirror existing Item[] operations but work with UnifiedItem[]
- ✅ Added scaling, calculations, and manipulation functions

#### Step 3: Infrastructure Layer  
- ✅ Created UnifiedRecipeRepository interface
- ✅ Implemented supabaseUnifiedRecipeRepository with automatic conversion
- ✅ Created unifiedRecipe application service
- ✅ All infrastructure automatically converts UnifiedItem[] ↔ Item[] for DB operations

#### Step 4: Testing
- ✅ Added comprehensive unifiedRecipeOperations.test.ts (16 test cases)
- ✅ Verified all UnifiedItem[] recipe operations work correctly
- ✅ Tested edge cases and error handling
- ✅ All tests pass, validating the implementation

### 🚧 In Progress

#### Step 5: UI Layer Migration
- 🔄 Update RecipeEditView to use UnifiedRecipe and UnifiedItem[] operations
- 🔄 Remove manual conversion from Item[] to UnifiedItem[] in UI
- 🔄 Update GroupChildrenEditor to work with UnifiedRecipe directly

#### Step 6: Utility Updates
- 🔄 Update macro calculation utilities to work transparently with UnifiedItem[]
- 🔄 Update conversion utilities to work with UnifiedRecipe

### 📋 Remaining Steps

#### Step 7: Complete Migration
- ⏳ Update all Recipe usages in application layer to use UnifiedRecipe
- ⏳ Add migration documentation for developers
- ⏳ Update any remaining references to legacy Item[] recipes

#### Step 8: Validation and Cleanup
- ⏳ Run full integration tests to ensure UI works end-to-end
- ⏳ Validate that database persistence still works correctly
- ⏳ Clean up any unused code or temporary compatibility layers

### Current State
The Recipe entity now supports both legacy Item[] and new UnifiedItem[] operations:
- **Database**: Still stores Item[] format for compatibility ✅
- **In-Memory**: Can use UnifiedItem[] for all operations ✅  
- **Conversion**: Automatic conversion between formats ✅
- **Operations**: Full UnifiedItem[] recipe operations available ✅
- **UI Components**: UnifiedRecipeEditView for native UnifiedItem[] operations ✅
- **Macro Calculations**: Support for both Recipe and UnifiedRecipe ✅
- **Legacy UI**: Still uses legacy Item[] operations (for compatibility) ⚠️
- **Application Layer**: Needs migration to use UnifiedRecipe natively 🚧

## Phase 3 Completed: UI Layer Support ✅

### Added Components:
1. **UnifiedRecipeEditView**: Native UnifiedItem[] component without manual conversions
2. **UnifiedRecipeEditContext**: Context provider for UnifiedRecipe operations
3. **Macro Calculation Updates**: `calcUnifiedRecipeMacros()` and `calcUnifiedRecipeCalories()`

### Key Benefits:
- No manual Item[] ↔ UnifiedItem[] conversions in UI code
- Direct use of unifiedRecipeOperations for all recipe modifications
- Copy/paste operations work directly with UnifiedItem[] arrays
- Cleaner component code with consistent data types

## Phase 4: Application Layer Migration 🚧

### Next Steps:
1. Update recipe application services to prefer UnifiedRecipe
2. Migrate route handlers to use UnifiedRecipe operations
3. Update any remaining UI integrations to use UnifiedRecipeEditView
4. Integration testing for end-to-end UnifiedRecipe flows
5. Performance validation and cleanup

### Current State
The Recipe entity now supports both legacy Item[] and new UnifiedItem[] operations:
- **Database**: Still stores Item[] format for compatibility ✅
- **In-Memory**: Can use UnifiedItem[] for all operations ✅  
- **Conversion**: Automatic conversion between formats ✅
- **Operations**: Full UnifiedItem[] recipe operations available ✅
- **UI Components**: UnifiedRecipeEditView available for native operations ✅
- **Macro Calculations**: Support for both Recipe and UnifiedRecipe ✅
- **Application Layer**: Needs migration to use UnifiedRecipe natively 🚧
