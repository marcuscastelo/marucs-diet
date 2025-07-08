# Macroflows – Concrete Codebase Style & Anti-Patterns Guide

This document provides **concrete, specific guidelines** for the Macroflows codebase, based on actual patterns found in the code and specific improvements needed.

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
TemplateSearchModal           // vs SearchModal
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
- **Never import or use side-effect utilities** (e.g., `handleApiError`, logging, toasts, API calls).
- **Only throw pure errors** (e.g., `throw new DomainError(...)`).
- If you need to provide error context, use custom error classes with properties, but do not depend on external modules.

```typescript
// GOOD (domain):
throw new GroupConflictError('Group mismatch', { groupId, recipeId })

// BAD (domain):
import { handleApiError } from '~/shared/error/errorHandler'
handleApiError(...)
```

### Application Layer (`~/modules/*/application/`)
**Purpose**: Use cases, orchestration, data conversion, error handling
- Responsible for catching errors from the domain and calling `handleApiError` with full context.
- Handles all user feedback (toasts, logging, etc.).

```typescript
try {
  domainFunc()
} catch (e) {
  handleApiError(e, {
    component: 'ItemGroupForm',
    operation: 'submitGroup',
    additionalData: { userId }
  })
  throw e
}
```

---

## Import Rules Violations
- **Barrel Files (`index.ts`) are BANNED:** The `GEMINI.md` explicitly states that barrel files (`index.ts`) that only re-export from other files are forbidden. An instance of this violation was found in `src/shared/domain/errors/index.ts`.

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

- **Domain layer:** Only throws pure errors. Never imports or uses `handleApiError` or any side-effect utility.
- **Application layer:** Always catches errors from domain and calls `handleApiError` with context (`component`, `operation`, `additionalData`).
- **UI/Controller:** May also call `handleApiError` for UI-specific errors.

**Example:**
```typescript
// Domain
throw new GroupConflictError('Group mismatch', { groupId, recipeId })

// Application
try {
  domainFunc()
} catch (e) {
  handleApiError(e, {
    component: 'ItemGroupForm',
    operation: 'submitGroup',
    additionalData: { userId }
  })
  throw e
}
```

---

## 🚦 Domain vs Application Logic

- **Domain validation:** Pure, context-free rules (e.g., "a group cannot have duplicate items").
- **Application validation:** Rules that depend on user, permissions, UI state, or workflow context.

```typescript
// Domain
export function isValidGroup(group: ItemGroup): boolean

// Application
export function canEditGroup(user: User, group: ItemGroup, screenState: ScreenState): boolean
```

---

## 🚫 Language Policy

- Prefer English for code, comments, and commits for consistency and future scalability.
- Portuguese is acceptable for internal docs or discussions if the whole team is fluent.
- UI/UX: always in Portuguese, as required by the product.

---

## **Fire-and-Forget Promises & the `void` Operator**

### When to Use `void` for Promises

- Use the `void` operator in event handlers (e.g., `onClick`, `onChange`) **only when**:
  - The async function's result is not needed for the user flow.
  - All error handling and user feedback (toasts, logging) are handled in the application layer.
  - The promise is truly fire-and-forget (e.g., background refresh, non-critical side effect).
- Do **not** use `.catch(() => {})` to silence errors. All errors must be handled in the application layer, and the `void` operator signals that the promise is intentionally not awaited in the UI.
- If the reason for `void` is not obvious, add a comment.

**Example:**
```tsx
// OK: fire-and-forget, feedback handled in application layer
<button onClick={() => {
  void insertDayDiet(createDayDiet({
    owner: currentUser().id,
    target_day: selectedDay,
    meals: DEFAULT_MEALS,
  }))
}}>
  Create blank day
</button>
```

### Why This Is Not a Code Smell
- The `void` operator is a clear, explicit signal to other developers that the promise is intentionally not awaited and that all error handling is delegated to the application layer.
- This pattern is preferred over leaving unhandled promises, which can cause linter/type-check errors, and over using `.catch(() => {})`, which can swallow errors silently.
- This approach keeps UI components clean and delegates all error/toast logic to the application layer, following Clean Architecture principles.
- **Fire-and-forget should be the exception, not the rule.**

#### Fire-and-Forget Checklist
- [ ] The promise result is not needed for the user flow.
- [ ] All error handling and user feedback are handled in the application layer.
- [ ] Usage is limited to event handlers, parallel effects, or non-critical callbacks.
- [ ] The reason for `void` is documented if not obvious.

---
