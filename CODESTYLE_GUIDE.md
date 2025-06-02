# Marucs Diet – Concrete Codebase Style & Anti-Patterns Guide

This document provides **concrete, specific guidelines** for the Marucs Diet codebase, based on actual patterns found in the code and specific improvements needed.

---

## 1. **Naming Conventions (Concrete Examples)**

### ✅ Good Naming
```typescript
// Functions: Descriptive action verbs
isRecipedGroupUpToDate(group, recipe) // vs checkGroup()
convertToGroups(data)                  // vs convert()
addItemsToGroup(group, items)         // vs addItems()

// Files: Specific purpose
comparison.ts                          // vs utils.ts
itemGroupService.ts                   // vs service.ts
macroOverflow.ts                      // vs overflow.ts

// Components: Complete description
ItemGroupEditModal                     // vs GroupModal
ExternalTemplateSearchModal           // vs SearchModal
```

### ❌ Avoid Generic Names
```typescript
// Too generic
utils.ts, helper.ts, common.ts
group(), item(), data()
Editor, Service, Manager
```

---

## 2. **Clean Architecture - Concrete Structure**

### Domain Layer (`~/modules/*/domain/`)
**Purpose**: Pure business logic, no side effects
```typescript
// ✅ GOOD: Pure domain functions
export function isRecipedGroupUpToDate(group: RecipedItemGroup, recipe: Recipe): boolean
export function createSimpleItemGroup({ name, items }: CreateGroupParams): SimpleItemGroup
export function getItemGroupQuantity(group: ItemGroup): number

// ❌ BAD: Side effects in domain
export function saveItemGroup(group: ItemGroup) // API calls don't belong here
export function displayError(message: string)  // UI concerns don't belong here
```

### Application Layer (`~/modules/*/application/`)
**Purpose**: Use cases, orchestration, data conversion
```typescript
// ✅ GOOD: Application logic
export function convertToGroups(convertible: GroupConvertible): ItemGroup[]
export async function insertItemGroup(dayId: number, mealId: number, group: ItemGroup)
export async function updateMeal(dayId: number, mealId: number, meal: Meal)

// ❌ BAD: Domain logic in application
export function isValidGroup(group: ItemGroup) // This belongs in domain
```

---

## 3. **Legacy Editor Pattern - CRITICAL TO AVOID**

### ❌ ANTI-PATTERN: Editor Classes (Found Throughout Codebase)
```typescript
// Examples of current legacy patterns that MUST be refactored:

// MealEditView.tsx - Line 112
const newMeal = new MealEditor(meal_)
  .addGroups(groupsToAdd)
  .finish()

// ItemGroupEditModal.tsx - Line 515  
const newGroup = new ItemGroupEditor(group_)
  .addItem(regenerateId(data))
  .finish()

// RecipeEditView.tsx - Line 245
const newRecipe = new RecipeEditor(recipe())
  .setPreparedMultiplier(newMultiplier())
  .finish()

// DayDietEditor usage throughout application layer
const newDay = new DayDietEditor(createNewDayDiet(currentDayDiet_))
  .editMeal(mealId, (editor) => editor?.replace(newMeal))
  .finish()
```

### ✅ REPLACEMENT: Pure Functions
```typescript
// Replace Editor pattern with pure functions:

// Instead of MealEditor
export function addGroupsToMeal(meal: Meal, groups: ItemGroup[]): Meal {
  return { ...meal, groups: [...meal.groups, ...groups] }
}

// Instead of ItemGroupEditor  
export function addItemToGroup(group: ItemGroup, item: Item): ItemGroup {
  return { ...group, items: [...group.items, item] }
}

// Instead of RecipeEditor
export function updateRecipePreparedMultiplier(recipe: Recipe, multiplier: number): Recipe {
  return { ...recipe, prepared_multiplier: multiplier }
}

// Instead of nested editor pattern
export function updateMealInDay(day: DayDiet, mealId: number, updatedMeal: Meal): DayDiet {
  return {
    ...day,
    meals: day.meals.map(meal => 
      meal.id === mealId ? updatedMeal : meal
    )
  }
}
```

### Why Editor Pattern Must Be Eliminated:
1. **Mutation instead of immutability** - Goes against React/SolidJS paradigms
2. **Complex state management** - Internal mutable state is hard to debug
3. **Not testable** - Side effects and complex object lifecycles
4. **Verbose and unidiomatic** - Modern JS/TS favors functional patterns
5. **Performance issues** - Unnecessary object creation and mutation

---

## 4. **Component Duplication - Specific Cases**

### ❌ Found Duplications
```typescript
// MealEditView.tsx and RecipeEditView.tsx have identical:
// 1. Copy/paste clipboard logic (lines 90-120 in both files)
// 2. Schema validation for clipboard
// 3. handlePasteAfterConfirm logic

// TODO comment in both files:
// "Remove code duplication between MealEditView and RecipeView"
```

### ✅ Solution: Extract Shared Logic
```typescript
// Create: ~/sections/common/hooks/useCopyPaste.ts
export function useCopyPaste<T>(schema: ZodSchema<T>) {
  const { clipboard, write, clear } = useClipboard({ filter: isValid })
  
  return {
    canPaste: () => isValid(clipboard()),
    copy: (data: T) => write(JSON.stringify(data)),
    paste: () => deserializeClipboard(clipboard(), schema),
    clear
  }
}

// Use in both components:
const { canPaste, copy, paste } = useCopyPaste(mealSchema)
```

---

## 5. **Type Guards - Current Issues**

### ❌ Found Anti-Patterns
```typescript
// itemGroupService.ts - Fragile type detection
function isRecipe(obj: any): obj is Recipe {
  return obj && typeof obj === 'object' && obj.__type === 'Recipe'
}

function isItem(obj: any): obj is Item {
  return obj && typeof obj === 'object' && 'reference' in obj
}
```

### ✅ Robust Type Guards
```typescript
// Better type guards with explicit checks
function isRecipe(obj: unknown): obj is Recipe {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    '__type' in obj &&
    obj.__type === 'Recipe' &&
    'id' in obj &&
    'name' in obj &&
    'items' in obj &&
    Array.isArray((obj as any).items)
  )
}

function isItem(obj: unknown): obj is Item {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'reference' in obj &&
    'quantity' in obj &&
    'macros' in obj &&
    typeof (obj as any).reference === 'number'
  )
}
```

---

## 6. **Object Comparison - Resolved Example**

### ✅ Good: Proper Deep Comparison (Already Implemented)
```typescript
// src/shared/utils/comparison.ts - GOOD EXAMPLE
export function deepEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null) return a === b
  if (typeof a !== typeof b) return false
  // ... proper recursive comparison
}

export function macrosAreEqual(macros1: any, macros2: any): boolean {
  const keys = ['calories', 'protein', 'carbs', 'fat']
  return keys.every(key => {
    const val1 = macros1[key]
    const val2 = macros2[key]
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      return Math.abs(val1 - val2) < 0.001 // Floating point tolerance
    }
    return val1 === val2
  })
}
```

---

## 7. **TODOs Found - Concrete Action Items**

### High Priority (Architecture Issues)
```typescript
// 1. Remove Editor patterns (DayDietEditor, MealEditor, etc.)
// Files: All under ~/legacy/utils/data/

// 2. Eliminate code duplication  
// Files: MealEditView.tsx, RecipeEditView.tsx (copy/paste logic)

// 3. Remove dayId parameter from functions that don't need it
// Files: ~/modules/diet/*/application/*.ts
// Example: updateMeal(_dayId: DayDiet['id'], ...) // Remove _dayId
```

### Medium Priority (Features)
```typescript
// 1. Recipe favorites functionality
// Files: ItemEditModal.tsx line 304

// 2. Complex recipe editing
// Files: ItemGroupEditModal.tsx line 717

// 3. Drag and drop functionality  
// Files: RecipeEditView.tsx line 21
```

---

## 8. **Specific File Migrations Needed**

### Legacy Files to Migrate/Remove:
1. `~/legacy/utils/data/` - **All Editor classes**
   - `dayDietEditor.ts` → Pure functions in `day-diet/application/`
   - `mealEditor.ts` → Pure functions in `meal/application/`
   - `itemGroupEditor.ts` → Pure functions in `item-group/application/`
   - `recipeEditor.ts` → Pure functions in `recipe/application/`

2. `~/legacy/utils/groupUtils.ts` - **✅ ALREADY COMPLETED**

### Components to Refactor:
1. Extract shared copy/paste logic from:
   - `MealEditView.tsx`
   - `RecipeEditView.tsx`

---

## 9. **Error Handling - Current Standards**

### ✅ Good Examples (Follow These)
```typescript
// Centralized error handling with context
handleApiError(error, {
  component: 'itemGroupApplication',
  operation: 'insertItemGroup', 
  additionalData: { mealId, groupName: newItemGroup.name }
})

// Domain validation with clear messages
if (groupRecipe.id !== group.recipe) {
  throw new Error('Invalid state! Group recipe is not the same as the recipe in the group!')
}
```

---

## 10. **Migration Checklist**

### Phase 1: Editor Pattern Elimination
- [ ] Create pure functions to replace `DayDietEditor`
- [ ] Create pure functions to replace `MealEditor`  
- [ ] Create pure functions to replace `ItemGroupEditor`
- [ ] Create pure functions to replace `RecipeEditor`
- [ ] Update all usages in application layer
- [ ] Remove legacy editor files

### Phase 2: Component Deduplication
- [ ] Extract `useCopyPaste` hook
- [ ] Refactor `MealEditView` to use shared hook
- [ ] Refactor `RecipeEditView` to use shared hook
- [ ] Remove TODO comments about duplication

### Phase 3: Type Safety Improvements
- [ ] Strengthen type guards in `itemGroupService.ts`
- [ ] Remove unnecessary `any` types
- [ ] Add proper error boundaries

---

## 11. **References & Examples**

### Architecture References
- **Domain**: `~/modules/diet/item-group/domain/itemGroup.ts` (✅ Good example)
- **Application**: `~/modules/diet/item-group/application/itemGroupService.ts` (✅ Good example)  
- **Utilities**: `~/shared/utils/comparison.ts` (✅ Good example)

### Anti-Pattern References  
- **Editor Pattern**: Any file using `new *Editor()` (❌ Legacy pattern)
- **Generic Utils**: Files named `utils.ts` (❌ Too generic)
- **Mixed Concerns**: Domain files with API calls (❌ Wrong layer)

---

**Next Actions**: Focus on eliminating Editor pattern first (highest impact), then address component duplication.
