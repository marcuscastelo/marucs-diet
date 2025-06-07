# Refactor Plan: Remove Loadable and Migrate to SolidJS Resource

## Goal
Remove all usage of the custom `Loadable` type and related types (`Loading`, `Loaded`, `Errored`) from the codebase, replacing them with SolidJS's `createResource` or idiomatic resource patterns.

---

## 1. Analysis Complete

### Files That Import `Loadable` Types (Confirmed):
- `src/legacy/utils/loadable.ts` (definition)
- `src/sections/common/hooks/useFetch.tsx` (import + usage)
- `src/sections/item-group/components/ItemGroupView.tsx` (import + usage)
- `src/sections/item-group/components/ItemGroupEditModal.tsx` (import + usage) 
- `src/sections/profile/measure/components/MeasuresEvolution.tsx` (import + usage)

### Dependency Chain:
- `useFetch` hook is used by: `src/sections/recipe/hooks/useRecipe.tsx`
- `useRecipe` might be used by other components (to be verified in each step)

---

## 2. Atomic Migration Steps (Testable with `npm run check`)

### Step 1: Refactor MeasuresEvolution (Isolated)
**File**: `src/sections/profile/measure/components/MeasuresEvolution.tsx`
- Replace `createSignal<Loadable<readonly Measure[]>>` with `createResource`
- Update loading/error/data access patterns
- **Test**: `npm run check` after this single file change

### Step 2: Refactor ItemGroupView (Isolated)  
**File**: `src/sections/item-group/components/ItemGroupView.tsx`
- Replace `createSignal<Loadable<Recipe | null>>` with `createResource` 
- Update recipe fetching logic and loading states
- **Test**: `npm run check` after this single file change

### Step 3: Refactor ItemGroupEditModal (Isolated)
**File**: `src/sections/item-group/components/ItemGroupEditModal.tsx`
- Replace `createSignal<Loadable<Recipe | null>>` with `createResource`
- Update recipe fetching and loading states  
- **Test**: `npm run check` after this single file change

### Step 4: Inline all useFetch usages in the codebase
- Replace all useFetch calls with their logic directly in each consumer file
- Remove dependency on Loadable in these files
- **Test**: `npm run check` after each file

### Step 4.1: Remove useFetch hook (deprecated)
**File**: `src/sections/common/hooks/useFetch.tsx`
- Delete the file after all usages are inlined
- **Test**: `npm run check`

### Step 5: Update inlined Loadable patterns to use createResource
- For each file where useFetch was inlined, refactor the inlined Loadable logic to use SolidJS createResource idioms
- Remove all remaining Loadable types and patterns
- **Test**: `npm run check` after each file

### Step 6: Find and Update All useFetch/useRecipe Consumers
- Search for all files importing `useRecipe` 
- Update each consumer to use resource patterns
- **Test**: `npm run check` after each consumer file

### Step 7: Delete Loadable Types
**File**: `src/legacy/utils/loadable.ts`
- Delete the entire file
- **Test**: `npm run check` (should pass - no remaining imports)

### Step 8: Final Validation
- Run full test suite if available
- Manual testing of affected UI flows
- **Test**: `npm run check` final validation

---

## 3. Implementation Notes

### SolidJS Resource Patterns:
```tsx
// Old Loadable pattern:
const [data, setData] = createSignal<Loadable<T>>({ loading: true })
if (data().loading) { /* loading UI */ }
if (data().errored) { /* error UI */ }
const value = data().data

// New Resource pattern:
const [data, { mutate, refetch }] = createResource(fetcher)
if (data.loading) { /* loading UI */ }
if (data.error) { /* error UI */ }  
const value = data()
```

### Error Handling:
- Keep existing `handleApiError` calls in application layer
- Resources will naturally handle loading/error states
- Maintain current error context and logging

---

## 4. Commit Strategy
Each step should be a separate commit:
- `refactor: migrate MeasuresEvolution from Loadable to createResource`
- `refactor: migrate ItemGroupView from Loadable to createResource`
- `refactor: migrate ItemGroupEditModal from Loadable to createResource`
- `refactor: update useFetch hook to return createResource`
- `refactor: update useRecipe to use new useFetch API`
- `refactor: update remaining useFetch consumers`
- `refactor: remove deprecated Loadable types`

---

## 5. Ready for Execution
✅ Dependencies analyzed  
✅ Files identified and confirmed  
✅ Steps are atomic and testable  
✅ Breaking changes isolated to single step  
✅ Rollback strategy clear (git revert per step)

**Ready to start with Step 1.**
