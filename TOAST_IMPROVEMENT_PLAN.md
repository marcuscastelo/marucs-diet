# Toast & Async Error Handling Improvement Plan

This document lists deprecated, incorrect, inconsistent, verbose, or improvable usages of async error handling, `catch`, `handleApiError`, `smartToastPromise`, `showError`, and similar patterns found in the inspected files. Each item includes a suggested improvement.

## 1. General Issues
- **Inconsistent use of `handleApiError`**: Some async functions use `catch` with `handleApiError`, others do not. Some errors are only logged to the console.
- **UI messages in English**: Some toast messages are in English, but per project guidelines, UI text should be in Portuguese (pt-BR).
- **Redundant/Verbose Toasts**: Some flows show multiple toasts for a single user action (e.g., after insert/update, a second toast for re-fetching data), which can be noisy.
- **Missing error context**: Some `handleApiError` calls lack detailed `additionalData`.
- **Async functions with silent catch**: Some `.catch(() => {})` patterns swallow errors without logging or user feedback.
- **Direct use of `showError` or `console.error`**: Should always use `handleApiError` for logging/reporting.
- **Lack of user feedback for background errors**: Some background operations fail silently or only log errors.
- **Deprecated/legacy patterns**: Some files may use old toast helpers or patterns that should be replaced with `smartToastPromise` or `showErrorToast`.

## 2. File-Specific Observations

### `src/modules/diet/day-diet/application/dayDiet.ts`
- Uses two `smartToastPromise` calls in sequence (insert, then fetch), resulting in two toasts for a single user action. This can be noisy for the user.
- Error handling is consistent with `handleApiError`, but could include more context (e.g., the data being inserted/updated).
- All UI messages are in Portuguese (correct).

### `src/modules/diet/macro-profile/application/macroProfile.ts`
- Uses `smartToastPromise` for background fetches, but UI messages are in Portuguese (correct).
- `.catch(() => {})` is used after `bootstrap()` in effects, which swallows errors silently. Should at least log or show a background error toast.

### `src/modules/diet/recipe/application/recipe.ts`
- Uses `smartToastPromise` with correct error handling and context.
- UI messages are in Portuguese (correct).
- `catch` block rethrows error after `handleApiError`, which is good, but ensure all usages provide enough context.

### `src/modules/measure/application/measure.ts`
- Uses `smartToastPromise` for insert/update, but some catch blocks only call `handleApiError` and rethrow, with no user feedback if the error is not caught elsewhere.
- UI messages are in Portuguese (correct).

### `src/modules/user/application/user.ts`
- Uses `smartToastPromiseDetached` for background fetches, with UI messages in English (should be Portuguese for user-facing text).
- Some async functions use only `handleApiError` in catch, with no user feedback.

### `src/modules/weight/application/weight.ts`
- Uses `smartToastPromiseDetached` for background fetches, with UI messages in Portuguese (correct).
- No error handling for insert/update/delete functions; errors may be swallowed silently.

### `src/sections/common/components/ToastTest.tsx`
- Test component: UI messages in English (acceptable for test/dev), but should be Portuguese if used in production.
- Some `.catch(() => {})` patterns swallow errors silently.

## 3. Recommendations

- [ ] **Standardize UI messages**: Ensure all user-facing toast messages are in Portuguese (pt-BR), including background operations.
- [ ] **Always provide error context**: All `handleApiError` calls should include `component`, `operation`, and relevant `additionalData`.
- [ ] **Avoid silent error swallowing**: Replace `.catch(() => {})` with at least a `console.error` or a background error toast.
- [ ] **Reduce toast noise**: For multi-step flows (e.g., insert then fetch), consider only showing a single toast, or use a less intrusive notification for background refreshes.
- [ ] **Replace legacy patterns**: Refactor any direct `showError` or `console.error` usage to use `handleApiError` and/or `showErrorToast`.
- [ ] **Add error handling to all async functions**: Ensure all async actions (insert, update, delete) have error handling and user feedback.
- [ ] **Review test/dev components**: If `ToastTest.tsx` is used in production, localize messages to Portuguese.

---

This plan should be reviewed and applied incrementally, with each change accompanied by updated tests and validation as per project guidelines.
