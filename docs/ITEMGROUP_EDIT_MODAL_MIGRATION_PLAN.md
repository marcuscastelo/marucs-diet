# ✅ COMPLETED: ItemGroupEditModal → UnifiedItemEditModal Migration

reportedBy: `migration-planner.v1`

## **🎉 MIGRATION COMPLETED SUCCESSFULLY**

**Completion Date**: 2025-06-19  
**Status**: ✅ All phases completed, legacy code removed, all tests passing

### **Migration Summary**
This migration plan has been **successfully completed**. All `ItemGroupEditModal` functionality has been migrated to the unified system:

- ✅ All usages migrated to `UnifiedItemEditModal` with proper type conversion
- ✅ All legacy components and wrappers removed 
- ✅ All tests and type checks passing
- ✅ Code duplication eliminated
- ✅ Business logic properly centralized in unified system

### **Final Results**
- **Files removed**: `ItemGroupEditModal`, related wrappers, and context providers
- **Conversion utility**: `itemGroupToUnifiedItem` used for type conversion
- **Test coverage**: Maintained through unified system integration
- **Performance**: Improved through code deduplication and centralized logic

---

## **ORIGINAL MIGRATION PLAN** (for historical reference)

### Strategy: Incremental Migration with Continuous Validation

This plan implemented a safe and progressive migration, where each functionality was added to `UnifiedItemEditModal` before removing `ItemGroupEditModal`.

---

## **PHASE 1: Preparation and Analysis**

### Step 1.1: Complete Dependency Audit
```bash
# Command to execute:
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "ItemGroupEditModal" | tee /tmp/itemgroup-usages.txt
```

**Expected output**: List of all files that reference `ItemGroupEditModal`
**Validation**: Confirm that only `test-app.tsx` and internal components use the modal

### Step 1.2: Verify Current Test State
```bash
npm run copilot:check | tee /tmp/pre-migration-tests.txt
```

**Success criteria**: "COPILOT: All checks passed!"
**If fails**: Fix issues before proceeding

---

## **PHASE 2: Extending UnifiedItemEditModal**

### Step 2.1: Implement Inline Group Name Editing

**Target file**: `src/sections/unified-item/components/UnifiedItemEditBody.tsx`

**Implementation**:
```tsx
// Add after existing imports:
import { updateUnifiedItemName } from '~/modules/diet/unified-item/domain/unifiedItemOperations'

// Add new InlineNameEditor component:
function InlineNameEditor(props: {
  item: Accessor<UnifiedItem>
  setItem: Setter<UnifiedItem>
  mode?: 'edit' | 'read-only' | 'summary'
}) {
  const [isEditing, setIsEditing] = createSignal(false)
  
  return (
    <Show when={isEditing() && props.mode === 'edit'} fallback={
      <div class="flex items-center gap-2">
        <span class="text-lg font-semibold text-white truncate">
          {props.item().name}
        </span>
        {props.mode === 'edit' && (
          <button
            class="btn btn-xs btn-ghost px-1"
            onClick={() => setIsEditing(true)}
            aria-label="Edit name"
          >
            ✏️
          </button>
        )}
      </div>
    }>
      <form class="flex items-center gap-2" onSubmit={(e) => {
        e.preventDefault()
        setIsEditing(false)
      }}>
        <input
          class="input input-xs flex-1 max-w-[200px]"
          type="text"
          value={props.item().name}
          onChange={(e) => props.setItem(updateUnifiedItemName(props.item(), e.target.value))}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
          ref={(ref) => setTimeout(() => {
            ref.focus()
            ref.select()
          }, 0)}
        />
        <button class="btn btn-xs btn-primary" type="submit">
          Save
        </button>
      </form>
    </Show>
  )
}
```

**Integration**: Replace `UnifiedItemName` with `InlineNameEditor` when `isGroup()` is true

### Step 2.2: Create updateUnifiedItemName

**Target file**: `src/modules/diet/unified-item/domain/unifiedItemOperations.ts` (create if doesn't exist)

```typescript
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

export function updateUnifiedItemName(item: UnifiedItem, newName: string): UnifiedItem {
  return {
    ...item,
    name: newName
  }
}
```

### Step 2.3: Test Name Functionality
```bash
npm run copilot:check
```

**Validation**: Verify that name editing works in UnifiedItemEditModal

---

## **PHASE 3: Implement Advanced Recipe Management**

### Step 3.1: Extend UnifiedItemEditBody with Recipe Actions

**Target file**: `src/sections/unified-item/components/UnifiedItemEditBody.tsx`

**Add props**:
```tsx
export type UnifiedItemEditBodyProps = {
  // ...existing props...
  recipeActions?: {
    onConvertToRecipe?: () => void
    onUnlinkRecipe?: () => void
    onEditRecipe?: () => void
    onSyncRecipe?: () => void
    isRecipeUpToDate?: boolean
  }
}
```

### Step 3.2: Implement Recipe Action Buttons

**Add component**:
```tsx
function RecipeActionButtons(props: {
  item: Accessor<UnifiedItem>
  actions?: UnifiedItemEditBodyProps['recipeActions']
}) {
  return (
    <Show when={props.actions && (isGroup(props.item()) || isRecipe(props.item()))}>
      <div class="flex gap-2 mb-4 justify-center">
        <Show when={isGroup(props.item()) && props.actions?.onConvertToRecipe}>
          <button
            class="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white"
            onClick={props.actions!.onConvertToRecipe}
            title="Convert to recipe"
          >
            🍳 Recipe
          </button>
        </Show>
        
        <Show when={isRecipe(props.item())}>
          <Show when={!props.actions?.isRecipeUpToDate}>
            <button
              class="btn btn-sm bg-orange-600 hover:bg-orange-700 text-white"
              onClick={props.actions?.onSyncRecipe}
              title="Sync with original recipe"
            >
              ⬇️ Sync
            </button>
          </Show>
          
          <button
            class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white"
            onClick={props.actions?.onEditRecipe}
            title="Edit recipe"
          >
            📝 Edit
          </button>
          
          <button
            class="btn btn-sm bg-red-600 hover:bg-red-700 text-white"
            onClick={props.actions?.onUnlinkRecipe}
            title="Unlink recipe"
          >
            🔗 Unlink
          </button>
        </Show>
      </div>
    </Show>
  )
}
```

### Step 3.3: Integrate Recipe Actions in UnifiedItemEditModal

**Target file**: `src/sections/unified-item/components/UnifiedItemEditModal.tsx`

**Add to props**:
```tsx
export type UnifiedItemEditModalProps = {
  // ...existing props...
  recipeActions?: UnifiedItemEditBodyProps['recipeActions']
}
```

**Pass to UnifiedItemEditBody**:
```tsx
<UnifiedItemEditBody
  // ...existing props...
  recipeActions={props.recipeActions}
/>
```

### Step 3.4: Test Recipe Actions
```bash
npm run copilot:check
```

---

## **PHASE 4: Implement Add Items Functionality**

### Step 4.1: Extend GroupChildrenEditor

**Target file**: `src/sections/unified-item/components/GroupChildrenEditor.tsx`

**Add props**:
```tsx
export type GroupChildrenEditorProps = {
  // ...existing props...
  onAddNewItem?: () => void
  showAddButton?: boolean
}
```

**Implement button**:
```tsx
// Add at the end of GroupChildrenEditor component:
<Show when={props.showAddButton && props.onAddNewItem}>
  <div class="mt-4">
    <button
      class="btn btn-sm bg-green-600 hover:bg-green-700 text-white w-full"
      onClick={props.onAddNewItem}
    >
      ➕ Add Item
    </button>
  </div>
</Show>
```

### Step 4.2: Integrate Template Search Modal

**Target file**: `src/sections/unified-item/components/UnifiedItemEditModal.tsx`

**Add state**:
```tsx
const [templateSearchVisible, setTemplateSearchVisible] = createSignal(false)
```

**Add props**:
```tsx
export type UnifiedItemEditModalProps = {
  // ...existing props...
  onAddNewItem?: () => void
  showAddItemButton?: boolean
}
```

**Integrate in JSX**:
```tsx
// Before </Modal>:
<Show when={props.showAddItemButton}>
  <ExternalTemplateSearchModal
    visible={templateSearchVisible}
    setVisible={setTemplateSearchVisible}
    // ...other necessary props
  />
</Show>
```

### Step 4.3: Test Add Items
```bash
npm run copilot:check
```

---

## **PHASE 5: Improve Macro Overflow**

### Step 5.1: Implement Advanced Macro Overflow

**Target file**: `src/sections/unified-item/components/UnifiedItemEditModal.tsx`

**Add logic**:
```tsx
const macroOverflowLogic = createMemo(() => {
  const originalItem = props.macroOverflow().originalItem
  if (!originalItem) return { enable: false }
  
  // Implement complex overflow logic similar to ItemGroupEditModal
  return {
    enable: true,
    originalItem,
    // Add specific fields as needed
  }
})
```

### Step 5.2: Test Macro Overflow
```bash
npm run copilot:check
```

---

## **PHASE 6: Migrate test-app.tsx**

### Step 6.1: Replace ItemGroupEditModal in test-app.tsx

**Target file**: `src/routes/test-app.tsx`

**Steps**:
1. Import `UnifiedItemEditModal` and `itemGroupToUnifiedItem`
2. Convert `ItemGroup` to `UnifiedItem` before passing to modal
3. Implement conversion handlers in callbacks
4. Add all necessary props (recipeActions, onAddNewItem, etc.)

**Implementation**:
```tsx
// Replace import:
import { UnifiedItemEditModal } from '~/sections/unified-item/components/UnifiedItemEditModal'
import { itemGroupToUnifiedItem, unifiedItemToItemGroup } from '~/modules/diet/unified-item/domain/conversionUtils'

// Convert group to unified item:
const unifiedItem = () => itemGroupToUnifiedItem(testGroup())

// Replace the modal:
<UnifiedItemEditModal
  targetMealName="Test"
  item={unifiedItem}
  macroOverflow={() => ({ enable: false })}
  onApply={(item) => {
    const convertedGroup = unifiedItemToItemGroup(item)
    // apply changes...
  }}
  recipeActions={{
    onConvertToRecipe: () => console.log('Convert to recipe'),
    onUnlinkRecipe: () => console.log('Unlink recipe'),
    // ...other handlers
  }}
  showAddItemButton={true}
  onAddNewItem={() => console.log('Add new item')}
/>
```

### Step 6.2: Create conversion functions if they don't exist

**Target file**: `src/modules/diet/unified-item/domain/conversionUtils.ts`

```typescript
export function unifiedItemToItemGroup(item: UnifiedItem): ItemGroup {
  // Implement UnifiedItem to ItemGroup conversion
  // Use existing logic as reference
}
```

### Step 6.3: Test Migration
```bash
npm run copilot:check
```

**Manual test**: Verify that test-app.tsx works with UnifiedItemEditModal

---

## **PHASE 7: Incremental Removal**

### Step 7.1: Remove Auxiliary Components

**Removal order**:
1. `ItemGroupEditModalActions.tsx`
2. `ItemGroupEditModalBody.tsx`
3. `ItemGroupEditModalTitle.tsx`
4. `GroupHeaderActions.tsx` (check if not used elsewhere)

**For each component**:
```bash
# Check usages:
grep -r "ComponentName" src/
# If no external usages, remove file
rm src/path/to/ComponentName.tsx
# Test:
npm run copilot:check
```

### Step 7.2: Remove Context

**Files**:
- `ItemGroupEditContext.tsx`
- `useItemGroupEditContext`

**Process**:
```bash
grep -r "ItemGroupEditContext" src/
# Remove files if no usages
rm src/sections/item-group/context/ItemGroupEditContext.tsx
npm run copilot:check
```

### Step 7.3: Clean Up Utilities

**Target file**: `src/modules/diet/item-group/application/itemGroupEditUtils.ts`

**Process**:
1. Identify still-used functions
2. Migrate useful functions to `unifiedItemService`
3. Remove file if empty
4. Update imports in dependent files

### Step 7.4: Remove Main Modal

```bash
rm src/sections/item-group/components/ItemGroupEditModal.tsx
npm run copilot:check
```

---

## **PHASE 8: Cleanup and Final Validation**

### Step 8.1: Update Barrel Exports

**Target file**: `src/sections/item-group/components/index.ts` (if exists)

Remove exports of deleted components

### Step 8.2: Check Broken Imports

```bash
npm run type-check
```

**If errors**: Fix imports and remaining references

### Step 8.3: Complete Final Test

```bash
npm run copilot:check
```

**Success criteria**: "COPILOT: All checks passed!"

### Step 8.4: Complete Manual Test

**Test scenarios**:
1. ✅ Edit group name inline
2. ✅ Convert group to recipe
3. ✅ Sync recipe
4. ✅ Add new item to group
5. ✅ Edit child items
6. ✅ Copy/paste groups
7. ✅ Macro overflow works correctly

---

## **VALIDATION CRITERIA FOR EACH PHASE**

### Technical Criteria:
- ✅ `npm run copilot:check` passes
- ✅ TypeScript compilation without errors
- ✅ ESLint without relevant warnings
- ✅ All tests pass

### Functional Criteria:
- ✅ Previous functionality preserved
- ✅ Performance maintained or improved
- ✅ UX consistent or improved

### Rollback Criteria:
If any phase fails:
1. Revert changes from the phase
2. Run tests
3. Analyze problem cause
4. Adjust plan if necessary

---

## **TIME ESTIMATION**

| Phase | Complexity | Estimated Time |
|-------|------------|----------------|
| Phase 1 | Low | 30 min |
| Phase 2 | Medium | 2 hours |
| Phase 3 | High | 4 hours |
| Phase 4 | Medium | 2 hours |
| Phase 5 | Medium | 1 hour |
| Phase 6 | High | 3 hours |
| Phase 7 | Low | 1 hour |
| Phase 8 | Low | 1 hour |
| **Total** | | **~14-16 hours** |

---

## **EXECUTION COMMANDS FOR LLM**

To execute this plan, use the following commands in sequence:

```bash
# Preparation
export GIT_PAGER=cat
npm run copilot:check | tee /tmp/pre-migration-baseline.txt

# Execute each phase sequentially
# Phase 1: Preparation
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "ItemGroupEditModal" 

# Phase 2-8: Implementation
# [Follow detailed steps above]

# Final validation
npm run copilot:check | tee /tmp/post-migration-validation.txt
```

## **FUNCTIONALITY ANALYSIS: ItemGroupEditModal vs UnifiedItemEditModal**

### ✅ **Features ALREADY COVERED in UnifiedItemEditModal**

1. **Individual Quantity Editing**: 
   - ✅ `QuantityControls` and `QuantityShortcuts` in `UnifiedItemEditBody`
   - ✅ Complete macro overflow support

2. **Children Editing**:
   - ✅ `GroupChildrenEditor` implements children editing
   - ✅ Nested modal for editing child items via recursive `UnifiedItemEditModal`

3. **Clipboard Actions**:
   - ✅ `useCopyPasteActions` with `unifiedItemSchema`
   - ✅ Copy/Paste of individual items

4. **Nutritional Information**:
   - ✅ `UnifiedItemViewNutritionalInfo`
   - ✅ Integrated macro calculations

5. **Recipe Editing**:
   - ✅ Support for `isRecipe()` with toggle between 'recipe' and 'group' modes
   - ✅ Sync with original recipe via `syncRecipeUnifiedItemWithOriginal`

6. **Favorites**:
   - ✅ `ItemFavorite` component for foods

### ⚠️ **Features LOST/LIMITED**

#### 1. **Group Name Editing** ❌
- **Lost**: `GroupNameEdit` component
- **Problem**: UnifiedItemEditModal doesn't allow inline group name editing
- **Impact**: Users can't rename groups directly in the modal

#### 2. **Complete Recipe Management** ⚠️
```tsx
// ItemGroupEditModal offers:
<ConvertToRecipeButton />        // ❌ Doesn't exist in UnifiedItemEditModal
<SyncRecipeButton />            // ⚠️ Limited in UnifiedItemEditModal  
<UnlinkRecipeButton />          // ❌ Doesn't exist in UnifiedItemEditModal
<RecipeButton />                // ⚠️ Different functionality
```

#### 3. **Advanced Recipe Actions** ❌
- **Lost**: Group to recipe conversion (`handleConvertToRecipe`)
- **Lost**: Recipe unlink with confirmation
- **Lost**: Visual indication of outdated recipe
- **Lost**: Bidirectional group ↔ recipe sync

#### 4. **Group-Specific Clipboard Actions** ⚠️
```tsx
// ItemGroupEditModal:
useItemGroupClipboardActions()  // Supports ItemGroup + Item + UnifiedItem
// UnifiedItemEditModal:
useCopyPasteActions()          // Only UnifiedItem
```

#### 5. **Add New Items** ❌
- **Lost**: Direct "Add item" button in modal
- **Lost**: Integration with `ExternalTemplateSearchModal`

#### 6. **Specific Edit Context** ❌
- **Lost**: `ItemGroupEditContext` with persistent state
- **Lost**: `persistentGroup` for change comparison
- **Lost**: `editSelection` system for editing individual items

#### 7. **Specific Modal Actions** ⚠️
```tsx
// ItemGroupEditModal has:
<ItemGroupEditModalActions />   // Specific buttons: Delete, Cancel, Apply
// UnifiedItemEditModal has:
// Only basic Cancel/Apply
```

This plan ensures a safe, incremental, and reversible migration with continuous validation at each step.
