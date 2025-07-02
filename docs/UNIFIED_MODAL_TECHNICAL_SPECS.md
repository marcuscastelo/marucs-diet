# Unified Modal System - Technical Specifications

## Interface Definitions

### Core Context Interface

```typescript
// src/sections/common/context/UnifiedModalContext.tsx
export interface UnifiedModalContext {
  // Core modal management
  openModal: <TProps = any>(config: ModalConfig<TProps>) => string
  closeModal: (modalId: string) => void
  closeAllModals: () => void
  closeTopModal: () => void
  updateModal: (modalId: string, updates: Partial<ModalConfig>) => void
  
  // Query functions
  getModal: (modalId: string) => ModalState | undefined
  getOpenModals: () => ModalState[]
  getModalsByType: (type: ModalType) => ModalState[]
  isModalOpen: (modalId: string) => boolean
  getTopModal: () => ModalState | undefined
  
  // Stack management
  getModalStack: () => ModalState[]
  getModalIndex: (modalId: string) => number
  
  // Event callbacks
  onModalOpen?: (modal: ModalState) => void
  onModalClose?: (modal: ModalState) => void
  onModalStackChange?: (stack: ModalState[]) => void
}
```

### Modal Configuration

```typescript
// src/sections/common/types/modalTypes.ts
export interface ModalConfig<TProps = any> {
  // Identity
  id?: string
  type: ModalType
  
  // Component to render
  component: Component<TProps>
  props?: TProps
  
  // Behavior configuration
  behavior?: ModalBehavior
  
  // Layout configuration
  layout?: ModalLayout
  
  // Accessibility configuration
  accessibility?: ModalAccessibility
  
  // Animation configuration
  animation?: ModalAnimation
  
  // Lifecycle callbacks
  lifecycle?: ModalLifecycle
}

export interface ModalBehavior {
  persistent?: boolean // Survives navigation
  dismissible?: boolean // Can be closed by backdrop/ESC
  preventBodyScroll?: boolean
  stackable?: boolean // Can have other modals on top
  autoFocus?: boolean // Auto-focus on open
  restoreFocus?: boolean // Restore focus on close
  closeOnRouteChange?: boolean
}

export interface ModalLayout {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  maxWidth?: string
  maxHeight?: string
  padding?: string
  margin?: string
  customClass?: string
}

export interface ModalAccessibility {
  role?: 'dialog' | 'alertdialog'
  ariaLabel?: string
  ariaLabelledBy?: string
  ariaDescribedBy?: string
  ariaModal?: boolean
  focusTrap?: boolean
  initialFocus?: string // CSS selector
  finalFocus?: string // CSS selector
}

export interface ModalAnimation {
  enter?: string // CSS class for enter animation
  exit?: string // CSS class for exit animation
  duration?: number // Animation duration in ms
  disabled?: boolean
}

export interface ModalLifecycle {
  onBeforeOpen?: () => void | Promise<void>
  onOpen?: () => void
  onBeforeClose?: () => void | Promise<void>
  onClose?: () => void
  onBackdropClick?: () => void
  onEscapeKey?: () => void
  onFocusIn?: (event: FocusEvent) => void
  onFocusOut?: (event: FocusEvent) => void
}

export enum ModalType {
  ERROR_DETAIL = 'error-detail',
  EDIT_FORM = 'edit-form',
  SEARCH = 'search',
  CONFIRMATION = 'confirmation',
  NOTIFICATION = 'notification',
  CUSTOM = 'custom'
}
```

### Modal State

```typescript
// src/sections/common/types/modalState.ts
export interface ModalState {
  id: string
  config: ModalConfig
  zIndex: number
  isVisible: boolean
  isAnimating: boolean
  createdAt: number
  updatedAt: number
  metadata?: ModalMetadata
}

export interface ModalMetadata {
  openedBy?: string // Component that opened the modal
  context?: Record<string, any> // Additional context data
  telemetry?: ModalTelemetry
}

export interface ModalTelemetry {
  openTime: number
  closeTime?: number
  userInteractions: ModalInteraction[]
}

export interface ModalInteraction {
  type: 'click' | 'keypress' | 'focus' | 'scroll'
  timestamp: number
  target?: string
  data?: any
}
```

## State Management Implementation

### Modal Store

```typescript
// src/sections/common/stores/modalStore.ts
interface ModalStore {
  modals: Map<string, ModalState>
  stack: string[] // Array of modal IDs in stack order
  nextZIndex: number
  focusHistory: HTMLElement[]
  lastActiveElement: HTMLElement | null
  config: ModalGlobalConfig
}

interface ModalGlobalConfig {
  baseZIndex: number
  zIndexIncrement: number
  maxStackSize: number
  defaultAnimationDuration: number
  enableTelemetry: boolean
  enablePerformanceMonitoring: boolean
}

// Default configuration
const DEFAULT_MODAL_CONFIG: ModalGlobalConfig = {
  baseZIndex: 1000,
  zIndexIncrement: 10,
  maxStackSize: 5,
  defaultAnimationDuration: 200,
  enableTelemetry: false,
  enablePerformanceMonitoring: false
}
```

### Store Actions

```typescript
// src/sections/common/stores/modalActions.ts
export interface ModalActions {
  // Core actions
  ADD_MODAL: 'ADD_MODAL'
  REMOVE_MODAL: 'REMOVE_MODAL'
  UPDATE_MODAL: 'UPDATE_MODAL'
  CLEAR_ALL_MODALS: 'CLEAR_ALL_MODALS'
  
  // Stack actions
  PUSH_TO_STACK: 'PUSH_TO_STACK'
  POP_FROM_STACK: 'POP_FROM_STACK'
  REORDER_STACK: 'REORDER_STACK'
  
  // Z-index actions
  UPDATE_Z_INDEX: 'UPDATE_Z_INDEX'
  RECALCULATE_Z_INDICES: 'RECALCULATE_Z_INDICES'
  
  // Focus actions
  SAVE_FOCUS: 'SAVE_FOCUS'
  RESTORE_FOCUS: 'RESTORE_FOCUS'
  
  // Configuration actions
  UPDATE_GLOBAL_CONFIG: 'UPDATE_GLOBAL_CONFIG'
}
```

## Component Architecture

### Unified Modal Provider

```typescript
// src/sections/common/context/UnifiedModalProvider.tsx
export function UnifiedModalProvider(props: {
  children: JSXElement
  config?: Partial<ModalGlobalConfig>
}) {
  const [store, setStore] = createStore<ModalStore>({
    modals: new Map(),
    stack: [],
    nextZIndex: props.config?.baseZIndex ?? 1000,
    focusHistory: [],
    lastActiveElement: null,
    config: { ...DEFAULT_MODAL_CONFIG, ...props.config }
  })

  // Context implementation...
  const context: UnifiedModalContext = {
    openModal: (config) => {
      // Implementation
    },
    closeModal: (id) => {
      // Implementation  
    },
    // ... other methods
  }

  return (
    <UnifiedModalContext.Provider value={context}>
      {props.children}
      <UnifiedModalContainer />
    </UnifiedModalContext.Provider>
  )
}
```

### Modal Container

```typescript
// src/sections/common/components/UnifiedModalContainer.tsx
export function UnifiedModalContainer() {
  const modalContext = useUnifiedModalContext()
  const openModals = () => modalContext.getOpenModals()

  return (
    <Portal mount={document.body}>
      <Show when={openModals().length > 0}>
        <ModalBackdropManager />
        <For each={openModals()}>
          {(modal) => (
            <ModalRenderer modal={modal} />
          )}
        </For>
      </Show>
    </Portal>
  )
}
```

### Modal Renderer

```typescript
// src/sections/common/components/ModalRenderer.tsx
export function ModalRenderer(props: { modal: ModalState }) {
  const modalContext = useUnifiedModalContext()
  
  const handleBackdropClick = () => {
    const { lifecycle, behavior } = props.modal.config
    if (behavior?.dismissible !== false) {
      lifecycle?.onBackdropClick?.()
      modalContext.closeModal(props.modal.id)
    }
  }

  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const { lifecycle, behavior } = props.modal.config
      if (behavior?.dismissible !== false) {
        lifecycle?.onEscapeKey?.()
        modalContext.closeModal(props.modal.id)
      }
    }
  }

  return (
    <div
      class="unified-modal-wrapper"
      style={{
        'z-index': props.modal.zIndex,
        position: 'fixed',
        inset: '0',
      }}
      onClick={handleBackdropClick}
      onKeyDown={handleEscapeKey}
    >
      <FocusTrap enabled={props.modal.config.accessibility?.focusTrap ?? true}>
        <div
          class="unified-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <Dynamic
            component={props.modal.config.component}
            {...(props.modal.config.props ?? {})}
          />
        </div>
      </FocusTrap>
    </div>
  )
}
```

## Migration Utilities

### Legacy Modal Adapter

```typescript
// src/sections/common/adapters/legacyModalAdapter.ts
export function createLegacyModalAdapter<T>(
  LegacyModalComponent: Component<T>
): Component<T & { modalId?: string }> {
  return (props) => {
    const modalContext = useUnifiedModalContext()
    
    // Create adapter that translates legacy modal API to unified system
    const adaptedProps = {
      ...props,
      onClose: () => {
        if (props.modalId) {
          modalContext.closeModal(props.modalId)
        }
        props.onClose?.()
      },
      visible: () => {
        if (props.modalId) {
          return modalContext.isModalOpen(props.modalId)
        }
        return props.visible?.() ?? false
      }
    }

    return <LegacyModalComponent {...adaptedProps} />
  }
}
```

### Migration Helper Functions

```typescript
// src/sections/common/utils/modalMigrationUtils.ts
export function migrateModalContextProvider(
  Component: any,
  modalConfig?: Partial<ModalConfig>
) {
  return (props: any) => {
    const modalContext = useUnifiedModalContext()
    
    const modalId = modalContext.openModal({
      type: ModalType.CUSTOM,
      component: Component,
      props: props,
      ...modalConfig
    })

    onCleanup(() => {
      modalContext.closeModal(modalId)
    })

    return null // Component is rendered by modal system
  }
}

export function createModalHook() {
  const modalContext = useUnifiedModalContext()
  
  return {
    openModal: modalContext.openModal,
    closeModal: modalContext.closeModal,
    isOpen: modalContext.isModalOpen,
    // Convenience methods for common modal types
    openErrorModal: (error: ToastError) => {
      return modalContext.openModal({
        type: ModalType.ERROR_DETAIL,
        component: ErrorDetailModal,
        props: { errorDetails: error, isOpen: true }
      })
    },
    openConfirmModal: (config: ConfirmModalConfig) => {
      return modalContext.openModal({
        type: ModalType.CONFIRMATION,
        component: ConfirmModal,
        props: config
      })
    }
  }
}
```

## Performance Optimizations

### Lazy Modal Loading

```typescript
// src/sections/common/utils/modalLazyLoading.ts
export function createLazyModal<T>(
  loader: () => Promise<{ default: Component<T> }>
): Component<T & { loading?: Component<any> }> {
  return (props) => {
    const [component, setComponent] = createSignal<Component<T> | null>(null)
    const [loading, setLoading] = createSignal(true)

    createEffect(async () => {
      try {
        const module = await loader()
        setComponent(() => module.default)
      } catch (error) {
        console.error('Failed to load modal component:', error)
      } finally {
        setLoading(false)
      }
    })

    return (
      <Show
        when={component()}
        fallback={
          loading() ? (
            props.loading ? <props.loading /> : <div>Loading...</div>
          ) : (
            <div>Failed to load modal</div>
          )
        }
      >
        {(Component) => <Component {...props} />}
      </Show>
    )
  }
}
```

### Virtual Modal Rendering

```typescript
// src/sections/common/utils/virtualModalRenderer.ts
export function VirtualModalRenderer() {
  const modalContext = useUnifiedModalContext()
  const [visibleModals, setVisibleModals] = createSignal<ModalState[]>([])

  // Only render modals that are actually visible
  createEffect(() => {
    const allModals = modalContext.getOpenModals()
    const visible = allModals.filter(modal => modal.isVisible)
    setVisibleModals(visible)
  })

  return (
    <For each={visibleModals()}>
      {(modal) => <ModalRenderer modal={modal} />}
    </For>
  )
}
```

## Testing Utilities

### Modal Testing Helpers

```typescript
// src/sections/common/testing/modalTestUtils.ts
export function createModalTestEnvironment() {
  const modalRegistry = new Map<string, ModalState>()
  
  return {
    openModal: (config: ModalConfig) => {
      const id = generateId()
      const modal: ModalState = {
        id,
        config,
        zIndex: 1000,
        isVisible: true,
        isAnimating: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      modalRegistry.set(id, modal)
      return id
    },
    
    closeModal: (id: string) => {
      modalRegistry.delete(id)
    },
    
    getModal: (id: string) => modalRegistry.get(id),
    getOpenModals: () => Array.from(modalRegistry.values()),
    
    // Test utilities
    expectModalToBeOpen: (id: string) => {
      expect(modalRegistry.has(id)).toBe(true)
    },
    
    expectModalToBeClosed: (id: string) => {
      expect(modalRegistry.has(id)).toBe(false)
    },
    
    expectModalCount: (count: number) => {
      expect(modalRegistry.size).toBe(count)
    }
  }
}

export function mockModalComponent<T>(props: T) {
  return (
    <div data-testid="mock-modal">
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  )
}
```

## Error Handling

### Modal Error Boundary

```typescript
// src/sections/common/components/ModalErrorBoundary.tsx
export function ModalErrorBoundary(props: {
  children: JSXElement
  fallback?: Component<{ error: Error; reset: () => void }>
  onError?: (error: Error, errorInfo: any) => void
}) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => {
        props.onError?.(error, { componentStack: 'Modal Component' })
        
        if (props.fallback) {
          return <props.fallback error={error} reset={reset} />
        }
        
        return (
          <div class="modal-error">
            <h3>Modal Error</h3>
            <p>An error occurred while rendering this modal.</p>
            <button onClick={reset}>Try Again</button>
          </div>
        )
      }}
    >
      {props.children}
    </ErrorBoundary>
  )
}
```

## Browser Compatibility

### Feature Detection

```typescript
// src/sections/common/utils/modalFeatureDetection.ts
export function detectModalFeatures() {
  return {
    dialog: typeof HTMLDialogElement !== 'undefined',
    backdrop: 'backdrop' in document.documentElement.style,
    focusTrap: typeof document.querySelector === 'function',
    intersectionObserver: typeof IntersectionObserver !== 'undefined',
    resizeObserver: typeof ResizeObserver !== 'undefined'
  }
}

export function getModalPolyfills() {
  const features = detectModalFeatures()
  const polyfills: Promise<any>[] = []
  
  if (!features.dialog) {
    polyfills.push(import('dialog-polyfill'))
  }
  
  if (!features.intersectionObserver) {
    polyfills.push(import('intersection-observer'))
  }
  
  return Promise.all(polyfills)
}
```
