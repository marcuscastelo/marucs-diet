# Lost Callbacks and Side Effects in Modal Migration

reportedBy: copilot.behavior-audit.v1

This document lists callbacks and side effects (behaviors) that appear to have been lost or are no longer triggered as a result of the migration from the legacy modal/context/modal provider system to the unified modal system. Only behaviors that were present before and are now missing (not replaced or moved) are listed.

---

## 1. `onRefetch` Callback in Template Search Modals

- **File:** `src/sections/search/components/ExternalTemplateSearchModal.tsx` (now deleted)
- **Behavior Lost:**
  - The `onRefetch` callback was triggered via a `createEffect` whenever the modal was closed (i.e., when `visible` became false). This allowed parent components to refresh data after the modal closed, regardless of how it was closed.
  - **No equivalent effect is present in the new unified modal system wrappers.**

---

## 2. `setEditSelection(null)` and `setTemplateSearchModalVisible(false)` in Nested Modals

- **File:** `src/sections/day-diet/components/DayMeals.tsx` (legacy code, removed)
- **Behavior Lost:**
  - In the legacy `ExternalUnifiedItemEditModal`, when the modal was closed (either via cancel or apply), the parent would clear the `editSelection` signal and set the modal visibility signal to false. This ensured parent state was always reset on close.
  - In the new system, the modal closes itself, but the parent state reset (`setEditSelection(null)`) is not always guaranteed unless explicitly handled in the new callback.

---

## 3. `onFinish` Callback for Template Search Modal

- **File:** `src/sections/search/components/ExternalTemplateSearchModal.tsx` (now deleted)
- **Behavior Lost:**
  - The `onFinish` callback was called after the modal was closed (e.g., after adding a new item or canceling). This allowed parent components to perform follow-up actions after the modal lifecycle.
  - In the new system, this callback is not always triggered on close, especially if the modal is closed via outside click or escape.

---

## 4. `onCancel` and `onClose` Propagation in Deeply Nested Modals

- **Files:**
  - `src/sections/unified-item/components/UnifiedItemEditModal.tsx`
  - `src/sections/recipe/components/RecipeEditModal.tsx`
- **Behavior Lost:**
  - In the legacy system, `onCancel` and `onClose` were propagated up through multiple layers (e.g., closing a child modal would trigger parent state resets and possibly parent modal closes).
  - In the new system, unless all `onClose`/`onCancel` handlers are explicitly passed and chained, some parent state resets may not occur.

---

## 5. `onRefetch` in Recipe Edit Modal

- **File:** `src/sections/recipe/components/RecipeEditModal.tsx`
- **Behavior Lost:**
  - The `onRefetch` callback was called after closing the template search modal (via effect on `visible`).
  - In the new system, this is not always called unless the new modal explicitly triggers it.

---

## 6. `setVisible(false)` on Mount in EANInsertModal

- **File:** `src/sections/ean/components/EANInsertModal.tsx`
- **Behavior Lost:**
  - The legacy modal called `setVisible(false)` on mount to ensure the modal started closed. In the new system, this is replaced by `handleCloseModal()`, but if the parent does not handle visibility, the modal may not close as expected.

---

## 7. `setShowConfirmEdit(true)` and Lock Logic in DayMeals

- **File:** `src/sections/day-diet/components/DayMeals.tsx`
- **Behavior Lost:**
  - The legacy code used `setShowConfirmEdit(true)` to trigger a confirmation modal before allowing edits. This logic is now commented out and not replaced with a new confirmation modal in the unified system.

---

## 8. `setItemEditModalVisible(false)` and `setSelectedItem(null)` in RecipeEditModal

- **File:** `src/sections/recipe/components/RecipeEditModal.tsx`
- **Behavior Lost:**
  - After closing the item edit modal, the parent would reset `setItemEditModalVisible(false)` and `setSelectedItem(null)`. In the new system, this is not always guaranteed unless handled in the new modal's `onClose`.

---

## 9. `setAddItemModalVisible(false)` and `setEditingChild(undefined)` in UnifiedItemEditModal

- **File:** `src/sections/unified-item/components/UnifiedItemEditModal.tsx`
- **Behavior Lost:**
  - After closing the add item modal or child edit modal, the parent would reset the relevant signals. In the new system, this is only preserved if the new modal's `onClose` is properly chained.

---

## 10. `onCancel` and `onApply` Chaining in External Modals

- **Files:**
  - `src/sections/unified-item/components/ExternalUnifiedItemEditModal.tsx`
  - `src/sections/search/components/ExternalEANInsertModal.tsx`
- **Behavior Lost:**
  - In the legacy system, closing the modal via cancel or apply would always trigger both the parent state reset and the modal close. In the new system, if the modal is closed via outside click or escape, the parent state reset may not occur.

---

# Summary

- The most common lost behaviors are parent state resets and callbacks (`onRefetch`, `onFinish`, `onCancel`, `setXxx(false)`) that were previously guaranteed by effect hooks or explicit signal management in the legacy modal/context/provider pattern.
- In the new unified modal system, these must be explicitly handled in the `onClose`/`onCancel` callbacks passed to the modal, or they may be lost, especially for modals closed via outside click or escape.
- Review all modal usages to ensure that any required parent state resets or callbacks are still triggered in all close scenarios.
