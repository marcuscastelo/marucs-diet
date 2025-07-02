# Modal Compatibility Matrix

## Current Modal Inventory

This document provides a comprehensive analysis of all existing modals in the MacroFlows application and their migration strategy to the unified modal system.

## Modal Categories

### 1. Error Detail Modals

| Component | Location | Current System | Migration Complexity | Breaking Changes |
|-----------|----------|----------------|---------------------|------------------|
| `ErrorDetailModal` | `src/sections/common/components/ErrorDetailModal.tsx` | Toast-based (`modalState.ts`) | Low | None |
| `GlobalModalContainer` | `src/modules/toast/ui/GlobalModalContainer.tsx` | Toast-based | Low | None |

**Migration Strategy:**
- Direct integration with unified system
- Maintain existing `openErrorModal()` API
- No changes to consuming components

### 2. Edit Form Modals

| Component | Location | Current System | Migration Complexity | Breaking Changes |
|-----------|----------|----------------|---------------------|------------------|
| `UnifiedItemEditModal` | `src/sections/unified-item/components/UnifiedItemEditModal.tsx` | `ModalContextProvider` | Medium | Minimal |
| `RecipeEditModal` | `src/sections/recipe/components/RecipeEditModal.tsx` | `ModalContextProvider` | Medium | Minimal |

**Migration Strategy:**
- Convert to unified modal components
- Update prop interfaces to match new system
- Maintain backward compatibility with wrapper components

### 3. Search Modals

| Component | Location | Current System | Migration Complexity | Breaking Changes |
|-----------|----------|----------------|---------------------|------------------|
| `TemplateSearchModal` | `src/sections/search/components/TemplateSearchModal.tsx` | `ModalContextProvider` | Medium | Minimal |
| `ExternalTemplateSearchModal` | `src/sections/search/components/ExternalTemplateSearchModal.tsx` | `ModalContextProvider` | Low | None |
| `ExternalEANInsertModal` | `src/sections/search/components/ExternalEANInsertModal.tsx` | `ModalContextProvider` | Low | None |
| `ExternalTemplateToUnifiedItemModal` | `src/sections/search/components/ExternalTemplateToUnifiedItemModal.tsx` | `ModalContextProvider` | Medium | Minimal |

**Migration Strategy:**
- Update external wrappers to use unified system
- Maintain existing prop interfaces
- Focus on internal implementation changes

### 4. Specialized Input Modals

| Component | Location | Current System | Migration Complexity | Breaking Changes |
|-----------|----------|----------------|---------------------|------------------|
| `EANInsertModal` | `src/sections/ean/components/EANInsertModal.tsx` | `ModalContextProvider` | Low | None |

**Migration Strategy:**
- Simple wrapper component conversion
- No API changes required

### 5. Day Diet Modals

| Component | Location | Current System | Migration Complexity | Breaking Changes |
|-----------|----------|----------------|---------------------|------------------|
| `CopyLastDayModal` | `src/sections/day-diet/components/CopyLastDayModal.tsx` | `ModalContextProvider` | Low | None |
| `PreviousDayDetailsModal` | `src/sections/day-diet/components/PreviousDayDetailsModal.tsx` | `ModalContextProvider` | Low | None |

**Migration Strategy:**
- Direct conversion to unified system
- Maintain existing prop interfaces

### 6. Confirmation Modals

| Component | Location | Current System | Migration Complexity | Breaking Changes |
|-----------|----------|----------------|---------------------|------------------|
| `ConfirmModal` | `src/sections/common/components/ConfirmModal.tsx` | `ConfirmModalContext` | Low | None |

**Migration Strategy:**
- Integrate with unified system's confirmation modal type
- Maintain `useConfirmModalContext()` API compatibility

## Detailed Migration Plans

### Phase 1: Foundation Components

#### `ErrorDetailModal` Migration
```typescript
// Before (current)
<ErrorDetailModal 
  errorDetails={error}
  isOpen={true}
  onClose={() => closeErrorModal(modalId)}
/>

// After (unified)
const modalId = openModal({
  type: ModalType.ERROR_DETAIL,
  component: ErrorDetailModal,
  props: { errorDetails: error },
  behavior: { 
    dismissible: true,
    persistent: true 
  }
})
```

#### `ConfirmModal` Migration
```typescript
// Before (current)
const { show } = useConfirmModalContext()
show({
  title: "Confirm Action",
  body: "Are you sure?",
  actions: [/* ... */]
})

// After (unified)
const { openConfirmModal } = useUnifiedModal()
openConfirmModal({
  title: "Confirm Action",
  message: "Are you sure?",
  onConfirm: () => {},
  onCancel: () => {}
})
```

### Phase 2: Search Modal System

#### `TemplateSearchModal` Migration
```typescript
// Before (current)
<ModalContextProvider 
  visible={visible} 
  setVisible={setVisible}
>
  <TemplateSearchModal 
    targetName="Food Search"
    onFinish={() => setVisible(false)}
  />
</ModalContextProvider>

// After (unified)
const modalId = openModal({
  type: ModalType.SEARCH,
  component: TemplateSearchModal,
  props: { 
    targetName: "Food Search",
    onFinish: () => closeModal(modalId)
  },
  layout: { size: 'lg' },
  behavior: { 
    stackable: true,
    focusTrap: true 
  }
})
```

### Phase 3: Edit Form Modals

#### `UnifiedItemEditModal` Migration
```typescript
// Before (current)
<ModalContextProvider 
  visible={editModalVisible} 
  setVisible={setEditModalVisible}
>
  <UnifiedItemEditModal
    item={() => selectedItem()}
    onApply={handleApply}
    onCancel={() => setEditModalVisible(false)}
  />
</ModalContextProvider>

// After (unified)
const modalId = openModal({
  type: ModalType.EDIT_FORM,
  component: UnifiedItemEditModal,
  props: {
    item: () => selectedItem(),
    onApply: handleApply,
    onCancel: () => closeModal(modalId)
  },
  behavior: {
    preventBodyScroll: true,
    focusTrap: true
  },
  accessibility: {
    ariaLabel: "Edit Item"
  }
})
```

## Backward Compatibility Strategy

### Legacy Wrapper Components

```typescript
// src/sections/common/adapters/LegacyModalContextProvider.tsx
export function LegacyModalContextProvider(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  children: JSXElement
}) {
  const { openModal, closeModal } = useUnifiedModal()
  const [modalId, setModalId] = createSignal<string | null>(null)

  createEffect(() => {
    if (props.visible() && !modalId()) {
      const id = openModal({
        type: ModalType.CUSTOM,
        component: () => props.children,
        behavior: { 
          dismissible: true 
        },
        lifecycle: {
          onClose: () => props.setVisible(false)
        }
      })
      setModalId(id)
    } else if (!props.visible() && modalId()) {
      closeModal(modalId()!)
      setModalId(null)
    }
  })

  return null // Children rendered by modal system
}
```

### Migration Utilities

```typescript
// src/sections/common/utils/modalMigrationHelpers.ts
export function createModalMigrationWrapper<T>(
  OriginalComponent: Component<T>
): Component<T & { __useUnifiedModal?: boolean }> {
  return (props) => {
    if (props.__useUnifiedModal) {
      // Use new unified system
      return <OriginalComponent {...props} />
    } else {
      // Use legacy system with adapter
      return <LegacyModalAdapter component={OriginalComponent} props={props} />
    }
  }
}

export function migrateModalProps<T extends Record<string, any>>(
  legacyProps: T,
  migration: ModalPropMigration<T>
): ModalConfig {
  return {
    type: migration.type,
    component: migration.component,
    props: migration.transformProps(legacyProps),
    ...migration.defaultConfig
  }
}

interface ModalPropMigration<T> {
  type: ModalType
  component: Component<any>
  transformProps: (props: T) => any
  defaultConfig?: Partial<ModalConfig>
}
```

## Feature Flag Implementation

```typescript
// src/shared/config/featureFlags.ts
export interface ModalFeatureFlags {
  // Core system flags
  enableUnifiedModalSystem: boolean
  enableLegacyCompatibility: boolean
  
  // Feature-specific flags
  enableModalStacking: boolean
  enableAdvancedAnimations: boolean
  enableModalTelemetry: boolean
  enableAccessibilityEnhancements: boolean
  
  // Performance flags
  enableVirtualModalRendering: boolean
  enableLazyModalLoading: boolean
  enableModalCaching: boolean
  
  // Debug flags
  enableModalDebugging: boolean
  enablePerformanceMonitoring: boolean
}

const DEFAULT_MODAL_FLAGS: ModalFeatureFlags = {
  enableUnifiedModalSystem: false, // Start disabled
  enableLegacyCompatibility: true,
  enableModalStacking: false,
  enableAdvancedAnimations: false,
  enableModalTelemetry: false,
  enableAccessibilityEnhancements: true,
  enableVirtualModalRendering: false,
  enableLazyModalLoading: false,
  enableModalCaching: false,
  enableModalDebugging: false,
  enablePerformanceMonitoring: false
}
```

## Migration Timeline

### Week 1: Foundation
- [ ] Create unified modal context and provider
- [ ] Implement core state management
- [ ] Create basic modal container
- [ ] Set up feature flags

### Week 2: Error Modal Migration
- [ ] Migrate `modalState.ts` to unified system
- [ ] Update `GlobalModalContainer`
- [ ] Create backward compatibility adapters
- [ ] Test error modal flows

### Week 3: Search Modal Migration
- [ ] Migrate `TemplateSearchModal`
- [ ] Update external wrapper components
- [ ] Test search modal workflows
- [ ] Verify no regressions

### Week 4: Edit Modal Migration
- [ ] Migrate `UnifiedItemEditModal`
- [ ] Migrate `RecipeEditModal`
- [ ] Update modal stacking behavior
- [ ] Test edit workflows

### Week 5: Remaining Modals
- [ ] Migrate remaining modals
- [ ] Update confirmation modal system
- [ ] Test all modal interactions
- [ ] Performance optimization

### Week 6: Cleanup and Documentation
- [ ] Remove legacy code (behind feature flag)
- [ ] Update documentation
- [ ] Final testing and bug fixes
- [ ] Prepare for release

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking changes in modal behavior | High | Medium | Comprehensive testing, feature flags |
| Performance regression | Medium | Low | Performance monitoring, optimization |
| Accessibility issues | High | Medium | Automated testing, manual review |
| Complex modal interactions breaking | High | Medium | Integration tests, user testing |
| Developer confusion during migration | Medium | High | Clear documentation, examples |

## Success Criteria

### Technical Metrics
- [ ] All existing modals work without changes
- [ ] No performance regressions (< 5% increase in render time)
- [ ] Test coverage > 90% for modal system
- [ ] Zero accessibility violations
- [ ] Bundle size increase < 10KB

### Developer Experience
- [ ] Reduced modal-related bug reports
- [ ] Simplified modal creation process
- [ ] Positive developer feedback
- [ ] Clear migration documentation

### User Experience
- [ ] Consistent modal behavior
- [ ] Improved accessibility scores
- [ ] No user-reported issues
- [ ] Better modal stacking behavior

## Rollback Plan

In case of critical issues:

1. **Immediate**: Disable unified system via feature flag
2. **Short-term**: Revert to legacy system completely
3. **Medium-term**: Fix issues and re-enable gradually
4. **Long-term**: Complete migration with fixes

Feature flags enable safe rollback at any point during migration.
