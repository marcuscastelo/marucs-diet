# Toast System Refactoring Plan

## Overview

Refactoring of the toast system to reduce visual clutter and improve user experience.

### Main Goals

1. **Filter Unnecessary Toasts**: Do not display loading/success toasts for background operations not initiated by the user  
2. **Queue System**: Limit toast visibility to one at a time, with a smart queue  
3. **Smart Error Messages**: Shorten long messages with option to expand  

### General Status
- **Start**: 2025-06-04  
- **Status**: 🚧 In Progress - Phase 5
- **Progress**: 10/18 commits (55.6%)

---

## Implementation Phases

### **Phase 1: New Toast Infrastructure**  
*Status: ✅ Complete*

#### Commit 1: Toast Configuration System
- **Status**: ✅ Complete  
- **Files to create**:  
  - `src/shared/toast/toastConfig.ts` ✅ 
- **Description**: Define types and base configurations for the toast system  
- **Tests**: ⏳ Pending

<details>
<summary>Technical Details</summary>

```typescript
export type ToastContext = 'user-action' | 'background' | 'system'
export type ToastLevel = 'info' | 'success' | 'warning' | 'error'

export type ToastOptions = {
  context: ToastContext
  level: ToastLevel
  showLoading?: boolean
  showSuccess?: boolean
  maxLength?: number
}
```
</details>

#### Commit 2: Toast Queue Manager  
- **Status**: ✅ Complete
- **Files to create**:  
  - `src/shared/toast/toastQueue.ts` ✅
- **Description**: Implement queue system to control sequential display  
- **Tests**: ⏳ Pending

#### Commit 3: Error Message Utility  
- **Status**: ✅ Complete
- **Files to create**:  
  - `src/shared/toast/errorMessageHandler.ts` ✅
- **Description**: Function to truncate and expand error messages  
- **Tests**: ⏳ Pending

---

### **Phase 2: Central Toast Manager**  
*Status: 🚧 In Progress*

#### Commit 4: Main ToastManager  
- **Status**: ✅ Complete
- **Files to create**:  
  - `src/shared/toast/toastManager.ts` ✅
- **Description**: Central class to manage all toasts  
- **Tests**: ⏳ Pending

#### Commit 5: Expandable Error Component  
- **Status**: ✅ Complete  
- **Files to create**:  
  - `src/shared/toast/ExpandableErrorToast.tsx` ✅
- **Description**: Toast component with error expansion option  
- **Tests**: ⏳ Pending

---

### **Phase 3: toastPromise Migration**  
*Status: ⏳ Pending*

#### Commit 6: Smart Toast Promise  
- **Status**: ✅ Complete  
- **Files created**:  
  - `src/shared/toast/smartToastPromise.ts` ✅ 
- **Description**: Intelligent version of toastPromise with context-aware behavior  
- **Tests**: ✅ Type-check passed

#### Commit 7: Critical Module Migration  
- **Status**: ✅ Complete  
- **Files modified**:  
  - `src/modules/diet/food/application/food.ts` ✅
  - `src/modules/user/application/user.ts` ✅
  - `src/modules/weight/application/weight.ts` ✅
  - `src/modules/diet/day-diet/application/dayDiet.ts` ✅
  - `src/modules/diet/recipe/application/recipe.ts` ✅
  - `src/modules/diet/macro-profile/application/macroProfile.ts` ✅
  - `src/modules/measure/application/measure.ts` ✅
  - `src/sections/food-item/components/RemoveFromRecentButton.tsx` ✅
  - `src/sections/day-diet/components/CreateBlankDayButton.tsx` ✅
- **Description**: Migrated all toastPromise usages to smartToastPromise with context-aware behavior  
- **Tests**: ✅ Type-check passed

---

### **Phase 4: Context Categorization**  
*Status: ✅ Complete*

#### Commit 8: User Operation Context  
- **Status**: ✅ Complete  
- **Files modified**: 14+ UI components migrated to `showError`, `showSuccess`
- **Description**: Tagged direct user actions vs background operations with proper context categorization
- **Tests**: ✅ Type-check passed

#### Commit 9: Background Operation Migration  
- **Status**: ✅ Complete  
- **Description**: Identified and migrated automatic operations with appropriate context specification
- **Tests**: ✅ Type-check passed

---

### **Phase 5: Smart Error Handling**  
*Status: ⏳ Pending*

#### Commit 10: Detailed Error Modal  
- **Status**: ⏳ Pending  
- **Files to create**:  
  - `src/sections/common/components/ErrorDetailModal.tsx`  
- **Description**: Modal to display full error details with copy option  
- **Tests**: ❌ Not run

#### Commit 11: Truncation Integration  
- **Status**: ⏳ Pending  
- **Description**: Apply truncation to all error toasts  
- **Tests**: ❌ Not run

---

### **Phase 6: Optimized Queue System**  
*Status: ⏳ Pending*

#### Commit 12: Smart Queue  
- **Status**: ⏳ Pending  
- **Description**: Implement toast grouping and prioritization  
- **Tests**: ❌ Not run

#### Commit 13: User Settings  
- **Status**: ⏳ Pending  
- **Files to create**:  
  - `src/shared/toast/toastSettings.ts`  
- **Description**: Customizable user toast settings  
- **Tests**: ❌ Not run

---

### **Phase 7: Final Cleanup and Migration**  
*Status: ⏳ Pending*

#### Commit 14: Remove Direct Imports  
- **Status**: ⏳ Pending  
- **Description**: Replace all direct `solid-toast` imports  
- **Tests**: ❌ Not run

#### Commit 15: UI Component Migration  
- **Status**: ⏳ Pending  
- **Description**: Migrate all remaining components  
- **Tests**: ❌ Not run

#### Commit 16: Documentation and Cleanup  
- **Status**: ⏳ Pending  
- **Description**: Remove legacy code and document the new system  
- **Tests**: ❌ Not run

---

### **Phase 8: Testing and Validation**  
*Status: ⏳ Pending*

#### Commit 17: End-to-End Testing  
- **Status**: ⏳ Pending  
- **Commands**: `npm run lint`, `npm run type-check`, `npm run test`  
- **Tests**: ❌ Not run

#### Commit 18: Final Adjustments  
- **Status**: ⏳ Pending  
- **Description**: Fixes based on final testing  
- **Tests**: ❌ Not run

---

## File Structure

### New Files to Be Created

```
src/shared/toast/
├── index.ts                    # Barrel export
├── toastConfig.ts             # Types and config
├── toastQueue.ts              # Queue system
├── toastManager.ts            # Central manager
├── smartToastPromise.ts       # Smart toastPromise
├── errorMessageHandler.ts     # Error handling
└── toastSettings.ts           # User settings

src/sections/common/components/
├── ExpandableErrorToast.tsx   # Expandable toast
└── ErrorDetailModal.tsx       # Detailed error modal
```

### Files to Be Modified

- `src/shared/toastPromise.ts` (will be deprecated)  
- All files directly importing `solid-toast`  
- Modules in `src/modules/*/application/`  
- Components in `src/sections/*/components/`  

---

## Success Criteria

### Quality Metrics
- [ ] **Toast Reduction**: 80% fewer background loading/success toasts  
- [ ] **Queue Control**: Only 1 toast visible at a time  
- [ ] **Smart Messages**: Truncated errors with expansion available  
- [ ] **Zero Regressions**: All existing functionality preserved  
- [ ] **Passing Tests**: 100% unit tests passing  

### Technical Validation
- [ ] `npm run lint` - No linting errors  
- [ ] `npm run type-check` - No TypeScript errors  
- [ ] `npm run test` - All tests pass  
- [ ] Performance maintained or improved  

---

## Development Log

### 2025-06-04
- 📋 **Planning**: Plan document created and translated to English
- ✅ **Commit 1**: Toast configuration system implemented  
- 🎯 **Next**: Start Commit 2 - Toast Queue Manager  

---

## Notes and Decisions

### Architectural Decisions
- **Singleton Pattern**: ToastManager will be a singleton for centralized control  
- **Context Pattern**: Differentiate between 'user-action', 'background', 'system'  
- **Queue Strategy**: FIFO with type-based priority (error > warning > success > info)  

### UX Considerations
- Error toasts remain until manually dismissed  
- Success toasts auto-dismiss after 3s  
- Background operations silent by default  

### Technologies Used
- **solid-toast**: Kept as base engine  
- **SolidJS**: Reactive patterns for state handling  
- **TypeScript**: Strong typing for configurations  

---

## Useful Commands

```bash
# Run tests
npm run test

# Check types
npm run type-check

# Linting
npm run lint

# Run all checks
npm run lint && npm run type-check && npm run test
```

---

*Document auto-updated during development*
