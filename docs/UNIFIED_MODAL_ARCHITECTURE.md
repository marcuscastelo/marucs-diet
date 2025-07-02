# Unified Modal State Management Architecture

## Overview

This document outlines the design and architecture for unifying the two existing modal systems in the MacroFlows application into a single, cohesive system.

## Current State Analysis

### System 1: Error Detail Modals (Toast-based)
**Location:** `src/modules/toast/application/modalState.ts`
- **State Management:** Global signals with array of modal states
- **Lifecycle:** Independent of toast lifecycle
- **Use Case:** Error detail modals triggered from toasts
- **Key Files:**
  - `src/modules/toast/application/modalState.ts` - State management
  - `src/modules/toast/ui/GlobalModalContainer.tsx` - Rendering container
  - `src/sections/common/components/ErrorDetailModal.tsx` - Modal component

### System 2: General UI Modals (Context-based)
**Location:** `src/sections/common/context/ModalContext.tsx`
- **State Management:** Local context with visible/setVisible pattern
- **Lifecycle:** Tied to component lifecycle
- **Use Case:** All other modals (edit forms, search, barcode, etc.)
- **Key Files:**
  - `src/sections/common/context/ModalContext.tsx` - Context definition
  - `src/sections/common/components/Modal.tsx` - Base modal component
  - Multiple wrapper components using `ModalContextProvider`

## Unified Architecture Design

### Core Principles

1. **Single Source of Truth:** All modal state managed centrally
2. **Type Safety:** Strong TypeScript types for all modal configurations
3. **Flexibility:** Support for different modal types and behaviors
4. **Performance:** Efficient rendering and state updates
5. **Accessibility:** Consistent ARIA attributes and focus management
6. **Developer Experience:** Simple API for creating and managing modals

### Architecture Components

#### 1. Unified Modal Context (`UnifiedModalContext`)

```typescript
interface UnifiedModalContext {
  // Core state management
  openModal: <T = any>(config: ModalConfig<T>) => string
  closeModal: (modalId: string) => void
  closeAllModals: () => void
  updateModal: (modalId: string, updates: Partial<ModalConfig>) => void
  
  // Query functions
  getModal: (modalId: string) => ModalState | undefined
  getOpenModals: () => ModalState[]
  isModalOpen: (modalId: string) => boolean
  
  // Stack management
  getTopModal: () => ModalState | undefined
  getModalStack: () => ModalState[]
}
```

#### 2. Modal Configuration System

```typescript
interface ModalConfig<T = any> {
  // Identity
  id?: string // Auto-generated if not provided
  type: ModalType
  
  // Content
  component: Component<T>
  props?: T
  
  // Behavior
  persistent?: boolean // Whether modal persists across navigation
  dismissible?: boolean // Can be closed by clicking backdrop/ESC
  preventScroll?: boolean
  
  // Layout
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  position?: 'center' | 'top' | 'bottom'
  
  // Z-index and stacking
  priority?: number // Higher priority = higher z-index
  stackable?: boolean // Can other modals open on top
  
  // Accessibility
  focusTrap?: boolean
  restoreFocus?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
  
  // Lifecycle callbacks
  onOpen?: () => void
  onClose?: () => void
  onBackdropClick?: () => void
  onEscapeKey?: () => void
}

enum ModalType {
  ERROR_DETAIL = 'error-detail',
  EDIT_FORM = 'edit-form', 
  SEARCH = 'search',
  CONFIRMATION = 'confirmation',
  CUSTOM = 'custom'
}
```

#### 3. Modal State Management

```typescript
interface ModalState {
  id: string
  config: ModalConfig
  zIndex: number
  isVisible: boolean
  createdAt: number
  updatedAt: number
}

interface ModalStore {
  modals: ModalState[]
  nextZIndex: number
  focusHistory: string[] // Track focus for restoration
}
```

#### 4. Component Hierarchy

```
UnifiedModalProvider
├── UnifiedModalContainer (Global renderer)
│   ├── ModalBackdrop (Shared backdrop with stacking)
│   └── For each modal:
│       ├── ModalWrapper (Z-index, positioning, animations)
│       │   ├── FocusTrap (If enabled)
│       │   └── DynamicModalComponent (User's modal content)
│       └── AccessibilityManager (ARIA, focus management)
└── Application Components
```

### Migration Strategy

#### Phase 1: Foundation (Issue #940)
1. Create `UnifiedModalContext` and provider
2. Implement core state management functions
3. Create `UnifiedModalContainer` for rendering
4. Add comprehensive unit tests

#### Phase 2: Error Modal Migration (Issue #941)
1. Create adapter for existing error modals
2. Migrate `modalState.ts` to use unified system
3. Update `GlobalModalContainer` to use new system
4. Maintain backward compatibility during transition

#### Phase 3: UI Modal Migration (Issue #942)
1. Create migration helpers for existing modal patterns
2. Update `ModalContext` to use unified system under the hood
3. Migrate individual modal components progressively
4. Remove deprecated `ModalContextProvider` pattern

#### Phase 4: Optimization & Cleanup (Issue #943)
1. Remove legacy code and systems
2. Optimize performance and bundle size
3. Add comprehensive integration tests
4. Update documentation

### API Design

#### Opening Modals

```typescript
// Simple modal
const modalId = openModal({
  type: ModalType.CUSTOM,
  component: MyModalComponent,
  props: { data: someData }
})

// Error modal (maintains current API)
const errorModalId = openErrorModal(errorDetails)

// Confirmation modal
const confirmModalId = openConfirmationModal({
  title: "Delete Item",
  message: "Are you sure?",
  onConfirm: () => deleteItem(),
  onCancel: () => console.log("Cancelled")
})

// Search modal with specific configuration
const searchModalId = openModal({
  type: ModalType.SEARCH,
  component: TemplateSearchModal,
  props: { targetName: "Food Search" },
  size: 'large',
  persistent: true,
  focusTrap: true
})
```

#### Closing Modals

```typescript
// Close specific modal
closeModal(modalId)

// Close top modal (ESC key behavior)
closeTopModal()

// Close all modals
closeAllModals()

// Close all modals of specific type
closeModalsByType(ModalType.SEARCH)
```

### Accessibility Features

1. **Focus Management:**
   - Automatic focus trapping within modals
   - Focus restoration when modal closes
   - Proper tab order maintenance

2. **ARIA Attributes:**
   - `role="dialog"` or `role="alertdialog"`
   - `aria-modal="true"`
   - `aria-labelledby` and `aria-describedby`
   - `aria-hidden` for background content

3. **Keyboard Navigation:**
   - ESC key to close (configurable)
   - Tab/Shift+Tab for navigation within modal
   - Arrow keys for modal stacks (if applicable)

### Z-Index and Stacking Strategy

```typescript
// Z-index calculation
const BASE_Z_INDEX = 1000
const MODAL_Z_INDEX_INCREMENT = 10
const BACKDROP_Z_INDEX_OFFSET = -1

// Formula: BASE_Z_INDEX + (modalIndex * MODAL_Z_INDEX_INCREMENT)
// Backdrop: modalZIndex + BACKDROP_Z_INDEX_OFFSET
```

**Stack Management:**
- Maximum 5 modals in stack (configurable)
- Priority-based stacking for system modals
- Visual indication of modal depth
- Automatic backdrop opacity adjustment

### Performance Considerations

1. **Lazy Rendering:** Only render visible modals
2. **Portal Usage:** Render modals at document root
3. **Event Delegation:** Single event listeners for backdrop/escape
4. **Animation Optimization:** CSS transitions over JS animations
5. **Memory Management:** Clean up closed modals from state

### Feature Flags for Gradual Rollout

```typescript
interface ModalFeatureFlags {
  enableUnifiedSystem: boolean
  enableModalStacking: boolean
  enableAdvancedAnimations: boolean
  enablePerformanceMonitoring: boolean
  legacyCompatibilityMode: boolean
}
```

### Compatibility Matrix

| Current Modal | Migration Strategy | Breaking Changes |
|---------------|-------------------|------------------|
| ErrorDetailModal | Direct adapter | None |
| TemplateSearchModal | Wrapper component | Minimal |
| UnifiedItemEditModal | Props mapping | Minimal |
| ConfirmModal | Built-in support | None |
| EANInsertModal | Component wrapper | Minimal |

### Testing Strategy

1. **Unit Tests:**
   - Modal state management functions
   - Focus management utilities
   - Accessibility helpers

2. **Integration Tests:**
   - Modal opening/closing flows
   - Stacking behavior
   - Event handling

3. **E2E Tests:**
   - Complete user workflows
   - Accessibility compliance
   - Cross-browser compatibility

4. **Performance Tests:**
   - Rendering performance with multiple modals
   - Memory usage monitoring
   - Animation performance

### Documentation Updates

1. **Developer Guide:** How to create and use modals
2. **Migration Guide:** Step-by-step migration from old system
3. **API Reference:** Complete API documentation
4. **Accessibility Guide:** Best practices for modal accessibility
5. **Troubleshooting:** Common issues and solutions

## Implementation Timeline

- **Week 1-2:** Core architecture and context implementation
- **Week 3:** Error modal system migration
- **Week 4-5:** UI modal system migration
- **Week 6:** Testing, optimization, and documentation
- **Week 7:** Final cleanup and release

## Success Metrics

1. **Code Quality:**
   - 100% test coverage for core modal system
   - Zero accessibility violations
   - No performance regressions

2. **Developer Experience:**
   - Reduced modal-related bug reports
   - Simplified modal creation process
   - Improved code maintainability

3. **User Experience:**
   - Consistent modal behavior across app
   - Improved accessibility scores
   - Better performance on low-end devices

## Risks and Mitigation

1. **Breaking Changes:** Maintain backward compatibility during migration
2. **Performance Impact:** Implement lazy loading and optimization
3. **Accessibility Regressions:** Comprehensive accessibility testing
4. **Complex State Management:** Thorough unit testing and documentation
5. **Browser Compatibility:** Cross-browser testing strategy
