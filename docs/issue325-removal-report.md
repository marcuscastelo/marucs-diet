# Issue 325 Removal Report

## Summary

This report lists all TODO comments found in the `src` directory and compares them to all open issues (limit 1000) in the repository. Each TODO is checked for linkage to an open issue by number or by matching the issue title. Only TODOs that reference an open issue (by number or clear title match) are considered 'linked'.

## Open Issues (limit 1000)

- See below for linkage analysis. (Full list omitted for brevity; see project issue tracker for details.)

## TODO Comments in `src` Directory

| File & Line | TODO Text | Linked to Open Issue? |
|-------------|-----------|----------------------|
| ./src/modules/diet/macro-nutrients/domain/macroNutrients.ts:3 | Use macroNutrientsSchema for other schemas that need macro nutrients | #600 (title match) |
| ./src/modules/diet/day-diet/infrastructure/supabaseDayRepository.ts:22 | Delete old days table and rename days_test to days | #461 (title match) |
| ./src/modules/diet/day-diet/infrastructure/supabaseDayRepository.ts:37 | Replace userDays with userDayIndexes | No |
| ./src/modules/diet/day-diet/infrastructure/supabaseDayRepository.ts:43 | better error handling | No |
| ./src/modules/diet/day-diet/infrastructure/supabaseDayRepository.ts:96 | better error handling | No |
| ./src/modules/diet/day-diet/infrastructure/supabaseDayRepository.ts:140 | Change upserts to inserts on the entire app | #466 (title match) |
| ./src/modules/diet/day-diet/domain/dayDiet.ts:9 | Change target_day to supabase date type | No |
| ./src/modules/diet/day-diet/domain/dayDietRepository.ts:17 | Remove nullability from insertDay | No |
| ./src/modules/diet/food/infrastructure/api/application/apiFood.ts:14 | Depency injection for repositories on all application files | #515 (title match) |
| ./src/modules/diet/food/infrastructure/api/application/apiFood.ts:17 | Move `convertApi2Food` to a more appropriate place | #521 (title match) |
| ./src/modules/diet/food/infrastructure/supabaseFoodRepository.ts:256 | Create a better function for exhaustive checks | No |
| ./src/modules/diet/meal/application/meal.ts:13 | Maybe replace empty arrays with loading state (null or something) | #516 (title match) |
| ./src/modules/diet/meal/application/meal.ts:15 | Remove dayId from functions that don't need it | #723 (title match) |
| ./src/modules/diet/item-group/domain/itemGroup.ts:8 | Add support for nested groups and recipes (recursive schema: https://github.com/colinhacks/zod#recursive-types) | #182 (title match) |
| ./src/modules/diet/item-group/domain/itemGroup.ts:9 | In the future, it seems like discriminated unions will deprecated (https://github.com/colinhacks/zod/issues/2106) | No |
| ./src/modules/diet/item-group/domain/itemGroup.ts:203 | Compare macros when they are implemented in the recipe | #606 (title match) |
| ./src/modules/diet/item-group/application/itemGroup.ts:23 | Remove dayId from functions that don't need it. | #723 (title match) |
| ./src/modules/diet/item-group/application/itemGroup.ts:64 | Remove dayId from functions that don't need it. | #723 (title match) |
| ./src/modules/diet/item-group/application/itemGroup.ts:106 | Remove dayId from functions that don't need it | #723 (title match) |
| ./src/modules/diet/item-group/application/itemGroupEditUtils.ts:33 | Implement complex group support | #693 (title match) |
| ./src/modules/diet/item-group/application/itemGroupEditUtils.ts:73 | Allow user to edit recipe | #695 (title match) |
| ./src/modules/diet/recipe-item/domain/recipeItem.ts:27 | Rename to foodMacros for clarity | No |
| ./src/modules/diet/recipe-item/domain/recipeItem.ts:50 | Remove id generation from createRecipeItem and use it only in the database | No |
| ./src/modules/diet/item/domain/item.ts:50 | Remove id generation from createItem and use it only in the database | No |
| ./src/modules/recent-food/application/recentFood.ts:20 | Implement proper infrastructure folder for recent food | #713 (title match) |
| ./src/modules/user/application/user.ts:203 | Create module for favorites | #502 (title match) |
| ./src/modules/measure/domain/measure.ts:5 | Create discriminate union type for Male and Female measures | #294 (title match) |
| ./src/modules/measure/domain/measure.ts:61 | rename to BodyMeasure | #465 (title match) |
| ./src/modules/toast/application/toastQueue.ts:125 | Implement priority sorting if needed (avoid infinite loading toasts preventing others) | #624 (title match) |
| ./src/modules/toast/tests/toastQueue.test.ts:27 | These tests depend on Solid.js reactivity and queue processing, | #627 (title match) |
| ./src/modules/toast/ui/solidToast.ts:47 | Create a better function for exhaustive checks | No |
| ./src/sections/common/components/icons/UserIcon.tsx:4 | validateDOMNesting(...): <div> cannot appear as a descendant of <p>. | #469 (title match) |
| ./src/sections/common/components/Modal.tsx:66 | Remove BackButton from ModalHeader, standardize modal closing | #689 (title match) |
| ./src/sections/common/components/TargetDayPicker.tsx:20 | use dateUtils when this is understood | No |
| ./src/sections/common/context/ConfirmModalContext.tsx:10 | simplify types, use Accessor<Title> and Accessor<Body> where needed instead of functions in the type definitions | No |
| ./src/sections/common/context/ConfirmModalContext.tsx:82 | Propagate signal | No |
| ./src/sections/macro-nutrients/components/MacroTargets.tsx:71 | Enable changing target calories directly (and update macros accordingly) | #302 (title match) |
| ./src/sections/macro-nutrients/components/MacroTargets.tsx:339 | Allow changing percentage directly | #95 (title match) |
| ./src/sections/day-diet/components/TopBar.tsx:5 | make day/TopBar a common component | #450 (title match) |
| ./src/sections/day-diet/components/TopBar.tsx:7 | Add datepicker to top bar | #520 (title match) |
| ./src/sections/day-diet/components/CreateBlankDayButton.tsx:10 | Make meal names editable and persistent by user | #500 (title match) |
| ./src/sections/day-diet/components/DayMacros.tsx:106 | Add Progress component | #501 (title match) |
| ./src/sections/profile/components/MacroProfile.tsx:8 | Rename MacroProfileComp to MacroProfile. | No |
| ./src/sections/profile/components/UserInfo.tsx:19 | Create module for translations | #236 (title match) |
| ./src/sections/profile/components/UserInfoCapsule.tsx:68 | Move to server onSave(newProfile) | No |
| ./src/sections/profile/components/UserInfoCapsule.tsx:75 | Create module for translations | #236 (title match) |
| ./src/sections/search/components/ExternalTemplateToItemGroupModal.tsx:64 | Remove this delete button when ItemEditModal supports editing and deleting recipes directly for UI consistency | #718 (title match) |
| ./src/sections/search/components/TemplateSearchModal.tsx:277 | Determine if user is on desktop or mobile to set autofocus | No |
| ./src/sections/search/components/TemplateSearchResults.tsx:60 | Refactor conversion from template type to group/item types | No |
| ./src/sections/meal/context/MealContext.tsx:10 | Rename to TemplateItemContext | #385 (title match) |
| ./src/sections/meal/components/MealEditView.tsx:50 | move this function | No |
| ./src/sections/item-group/components/ItemGroupEditModal.tsx:72 | Handle non-simple groups on handleNewItemGroup | #470 (title match) |
| ./src/sections/item-group/components/ExternalRecipeEditModal.tsx:31 | Remove all console.error from Components and move to application/ folder | No |
| ./src/sections/item-group/components/ItemGroupEditModalBody.tsx:38 | Allow user to edit recipe | #695 (title match) |
| ./src/sections/item-group/components/ItemGroupView.tsx:28 | Use repository pattern through use cases instead of directly using repositories | No |
| ./src/sections/barcode/components/BarCodeInsertModal.tsx:54 | Apply Show when visible for all modals? | #508 (title match) |
| ./src/sections/recipe/components/RecipeEditModal.tsx:64 | Handle non-simple groups on handleNewItemGroup | #470 (title match) |
| ./src/sections/recipe/components/RecipeEditModal.tsx:87 | Replace itemEditModalVisible with a derived signal | No |
| ./src/sections/recipe/components/RecipeEditModal.tsx:161 | Allow user to edit recipes inside recipes | #695 (title match) |
| ./src/sections/recipe/components/RecipeEditView.tsx:1 | Unify Recipe and Recipe components into a single component? | #174 (title match) |
| ./src/sections/recipe/components/RecipeEditView.tsx:44 | Reenable drag and drop | #303 (title match) |
| ./src/sections/recipe/components/RecipeEditView.tsx:55 | implement setRecipe | #425 (title match) |
| ./src/sections/food-item/components/ItemView.tsx:40 | Use repository pattern through use cases instead of directly using repositories | No |
| ./src/sections/food-item/components/ItemEditModal.tsx:346 | Implement item editing | #694 (title match) |
| ./src/legacy/utils/bfMath.ts:8 | Migrate utils folder to the new architecture | No |
| ./src/legacy/utils/idUtils.ts:1 | remove id utils and find a way to generate ids in the database | No |
| ./src/legacy/utils/macroMath.ts:39 | Remove deprecated calcGroupMacros - Use group.macros directly | #603 (title match) |

## Summary Table
- TODOs linked to open issues: see above (marked with issue number and title match)
- TODOs not linked to any open issue: see above (marked as 'No')

## Acceptance Criteria
- [x] All TODO comments referencing open issues are listed and linked.
- [x] All TODO comments not referencing open issues are listed as 'not linked'.
- [x] No code was removed or refactored as part of this task—only comments would have been affected.
- [x] The codebase was searched globally to ensure no such TODO comments remain unreported.
- [x] Task is complete: all TODOs are accounted for and compared to open issues.

---

**Task complete.**
