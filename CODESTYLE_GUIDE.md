# Marucs Diet – Concrete Codebase Style & Anti-Patterns Guide

This document provides **concrete, specific guidelines** for the Marucs Diet codebase, based on actual patterns found in the code and specific improvements needed.

---

## **Naming Conventions (Concrete Examples)**

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

## **Clean Architecture - Concrete Structure**

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

## **Component Duplication - Specific Cases**

### ❌ Found Duplications
```typescript
// MealEditView.tsx and RecipeEditView.tsx have identical:
// 1. Copy/paste clipboard logic (lines 90-120 in both files)
// 2. Schema validation for clipboard
// 3. handlePasteAfterConfirm logic

// TODO comment in both files:
// "Remove code duplication between MealEditView and RecipeView"
```


## 🛑 Error Handling Standard

All domain and application errors must be reported using the shared error handler utility:

- Use `handleApiError` from `~/shared/error/errorHandler` to log, report, or propagate errors.
- Never throw or log errors directly in domain/application code without also calling `handleApiError`.
- Always provide context (component, operation, additionalData) for traceability.

**Example:**
```typescript
import { handleApiError } from '~/shared/error/errorHandler'

if (somethingWentWrong) {
  handleApiError(new Error('Something went wrong'), {
    component: 'itemGroupDomain',
    operation: 'isRecipedGroupUpToDate',
    additionalData: { groupId, groupRecipeId }
  })
  throw new Error('Something went wrong')
}
```

## 📖 See also

For module structure, layering, and architecture examples, see [`ARCHITECTURE_GUIDE.md`](./ARCHITECTURE_GUIDE.md).

---

## 🚫 Language Policy

All code, comments, documentation, and commit messages must be written strictly in English. The only exception is user-facing UI text, which may be in Portuguese if required by the product. Any other use of Portuguese is strictly prohibited.

---
