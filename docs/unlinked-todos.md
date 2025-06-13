# TODOs Not Linked to Any Open Issue

This document lists all TODO comments found in the `src` directory that are **not** linked to any open issue (by number or title match) as of June 13, 2025.

## Unlinked TODO Comments

| File & Line | TODO Text |
|-------------|-----------|
| ./src/modules/diet/day-diet/infrastructure/supabaseDayRepository.ts:37 | Replace userDays with userDayIndexes |
| ./src/modules/diet/day-diet/infrastructure/supabaseDayRepository.ts:43 | better error handling |
| ./src/modules/diet/day-diet/infrastructure/supabaseDayRepository.ts:96 | better error handling |
| ./src/modules/diet/day-diet/domain/dayDiet.ts:9 | Change target_day to supabase date type |
| ./src/modules/diet/day-diet/domain/dayDietRepository.ts:17 | Remove nullability from insertDay |
| ./src/modules/diet/food/infrastructure/supabaseFoodRepository.ts:256 | Create a better function for exhaustive checks |
| ./src/modules/diet/item-group/domain/itemGroup.ts:9 | In the future, it seems like discriminated unions will deprecated (https://github.com/colinhacks/zod/issues/2106) |
| ./src/modules/diet/recipe-item/domain/recipeItem.ts:27 | Rename to foodMacros for clarity |
| ./src/modules/diet/recipe-item/domain/recipeItem.ts:50 | Remove id generation from createRecipeItem and use it only in the database |
| ./src/modules/diet/item/domain/item.ts:50 | Remove id generation from createItem and use it only in the database |
| ./src/modules/toast/ui/solidToast.ts:47 | Create a better function for exhaustive checks |
| ./src/sections/common/components/TargetDayPicker.tsx:20 | use dateUtils when this is understood |
| ./src/sections/common/context/ConfirmModalContext.tsx:10 | simplify types, use Accessor<Title> and Accessor<Body> where needed instead of functions in the type definitions |
| ./src/sections/common/context/ConfirmModalContext.tsx:82 | Propagate signal |
| ./src/sections/search/components/TemplateSearchModal.tsx:277 | Determine if user is on desktop or mobile to set autofocus |
| ./src/sections/search/components/TemplateSearchResults.tsx:60 | Refactor conversion from template type to group/item types |
| ./src/sections/meal/components/MealEditView.tsx:50 | move this function |
| ./src/sections/item-group/components/ExternalRecipeEditModal.tsx:31 | Remove all console.error from Components and move to application/ folder |
| ./src/sections/item-group/components/ItemGroupView.tsx:28 | Use repository pattern through use cases instead of directly using repositories |
| ./src/sections/recipe/components/RecipeEditModal.tsx:87 | Replace itemEditModalVisible with a derived signal |
| ./src/sections/profile/components/MacroProfile.tsx:8 | Rename MacroProfileComp to MacroProfile. |
| ./src/sections/profile/components/UserInfoCapsule.tsx:68 | Move to server onSave(newProfile) |
| ./src/legacy/utils/bfMath.ts:8 | Migrate utils folder to the new architecture |
| ./src/legacy/utils/idUtils.ts:1 | remove id utils and find a way to generate ids in the database |
