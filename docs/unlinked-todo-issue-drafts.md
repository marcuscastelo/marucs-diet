# Drafts for New Issues: Unlinked TODOs

This file contains draft issue descriptions for all relevant TODOs found in `src` that are not currently tracked by an open issue. Each draft is ready to be copy-pasted or further refined before submission to the issue tracker.

---

## Replace userDays with userDayIndexes
**File:** `src/modules/diet/day-diet/infrastructure/supabaseDayRepository.ts:37`

**Description:**
Replace all usage of `userDays` with `userDayIndexes` in the day-diet infrastructure. This will improve clarity and maintainability.

---

## Change target_day to supabase date type
**File:** `src/modules/diet/day-diet/domain/dayDiet.ts:9`

**Description:**
Update the `target_day` field to use the Supabase date type for better compatibility and type safety.

---

## Remove nullability from insertDay
**File:** `src/modules/diet/day-diet/domain/dayDietRepository.ts:17`

**Description:**
Refactor the `insertDayDiet` function to remove nullability from its return type, ensuring more predictable and type-safe behavior.

---

## Create a better function for exhaustive checks
**File:** `src/modules/diet/food/infrastructure/supabaseFoodRepository.ts:256`

**Description:**
Implement a more robust and reusable function for exhaustive checks in the food repository to improve code safety and maintainability.

---

## Monitor Zod discriminated union deprecation
**File:** `src/modules/diet/item-group/domain/itemGroup.ts:9`

**Description:**
Track the deprecation of discriminated unions in Zod. Prepare to refactor schemas if/when this feature is removed or changed upstream.

---

## Rename to foodMacros for clarity
**File:** `src/modules/diet/recipe-item/domain/recipeItem.ts:27`

**Description:**
Rename the `macros` property to `foodMacros` for improved clarity and consistency in the recipe item domain.

---

## Remove id generation from createRecipeItem and use it only in the database
**File:** `src/modules/diet/recipe-item/domain/recipeItem.ts:50`

**Description:**
Refactor `createRecipeItem` so that ID generation is handled exclusively by the database, not in the application code.

---

## Remove id generation from createItem and use it only in the database
**File:** `src/modules/diet/item/domain/item.ts:50`

**Description:**
Refactor `createItem` so that ID generation is handled exclusively by the database, not in the application code.

---

## Create a better function for exhaustive checks (toast)
**File:** `src/modules/toast/ui/solidToast.ts:47`

**Description:**
Implement a more robust and reusable function for exhaustive checks in the toast UI module.

---

## Use dateUtils in TargetDayPicker
**File:** `src/sections/common/components/TargetDayPicker.tsx:20`

**Description:**
Refactor `TargetDayPicker` to use `dateUtils` for date handling when feasible.

---

## Simplify types in ConfirmModalContext
**File:** `src/sections/common/context/ConfirmModalContext.tsx:10`

**Description:**
Simplify types in `ConfirmModalContext` by using `Accessor<Title>` and `Accessor<Body>` where appropriate instead of function types.

---

## Propagate signal in ConfirmModalContext
**File:** `src/sections/common/context/ConfirmModalContext.tsx:82`

**Description:**
Ensure that the `actions` signal is properly propagated in `ConfirmModalContext` for better state management.

---

## Set autofocus based on device in TemplateSearchModal
**File:** `src/sections/search/components/TemplateSearchModal.tsx:277`

**Description:**
Determine if the user is on desktop or mobile and set autofocus accordingly in `TemplateSearchModal` for improved UX.

---

## Refactor conversion from template type to group/item types
**File:** `src/sections/search/components/TemplateSearchResults.tsx:60`

**Description:**
Refactor the conversion logic from template type to group/item types for clarity and maintainability.

---

## Move function in MealEditView
**File:** `src/sections/meal/components/MealEditView.tsx:50`

**Description:**
Move the specified function in `MealEditView` to a more appropriate location/module.

---

## Remove all console.error from Components and move to application folder
**File:** `src/sections/item-group/components/ExternalRecipeEditModal.tsx:31`

**Description:**
Remove all `console.error` statements from UI components and move error handling to the application layer.

---

## Use repository pattern in ItemGroupView
**File:** `src/sections/item-group/components/ItemGroupView.tsx:28`

**Description:**
Refactor `ItemGroupView` to use the repository pattern through use cases instead of directly using repositories.

---

## Replace itemEditModalVisible with a derived signal
**File:** `src/sections/recipe/components/RecipeEditModal.tsx:87`

**Description:**
Refactor `RecipeEditModal` to use a derived signal instead of `itemEditModalVisible` for state management.

---

## Rename MacroProfileComp to MacroProfile
**File:** `src/sections/profile/components/MacroProfile.tsx:8`

**Description:**
Rename the `MacroProfileComp` component to `MacroProfile` for naming consistency.

---

## Move to server onSave(newProfile) in UserInfoCapsule
**File:** `src/sections/profile/components/UserInfoCapsule.tsx:68`

**Description:**
Move the `onSave(newProfile)` logic to the server for better separation of concerns and security.

---

## Migrate utils folder to the new architecture
**File:** `src/legacy/utils/bfMath.ts:8`

**Description:**
Migrate the legacy `utils` folder to the new project architecture.

---

## Remove id utils and find a way to generate ids in the database
**File:** `src/legacy/utils/idUtils.ts:1`

**Description:**
Remove the legacy `idUtils` and ensure all ID generation is handled by the database.
