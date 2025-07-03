# Modal System Migration Examples

This document provides examples of how to migrate from the legacy `ModalContextProvider` pattern to the unified modal system.

## Simple Modal Migration

### Before (Legacy Pattern)
```tsx
// External wrapper component
export function ExternalEANInsertModal(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onSelect: (food: Food) => void
}) {
  return (
    <ModalContextProvider visible={props.visible} setVisible={props.setVisible}>
      <EANInsertModal onSelect={props.onSelect} />
    </ModalContextProvider>
  )
}

// Modal component
const EANInsertModal = (props: EANInsertModalProps) => {
  const { visible, setVisible } = useModalContext()
  
  return (
    <Modal>
      <Modal.Header title="Search by barcode" />
      <Modal.Content>
        {/* Content */}
      </Modal.Content>
      <Modal.Footer>
        <Button onClick={() => setVisible(false)}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
}
```

### After (Unified Modal System)
```tsx
// External wrapper component - now uses openContentModal
export function ExternalEANInsertModal(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onSelect: (food: Food) => void
}) {
  const { closeModal } = useUnifiedModal()
  let modalId: string | null = null

  createEffect(() => {
    const isVisible = props.visible()
    
    if (isVisible && modalId === null) {
      modalId = openContentModal(
        <EANInsertModal 
          onSelect={(food) => {
            props.onSelect(food)
            if (modalId) {
              closeModal(modalId)
              modalId = null
            }
            props.setVisible(false)
          }}
          onClose={() => {
            if (modalId) {
              closeModal(modalId)
              modalId = null
            }
            props.setVisible(false)
          }}
        />,
        {
          title: 'Search by barcode',
          size: 'large',
        }
      )
    } else if (!isVisible && modalId !== null) {
      closeModal(modalId)
      modalId = null
    }
  })

  return null
}

// Modal component - now accepts onClose callback
const EANInsertModal = (props: EANInsertModalProps & {
  onClose?: () => void
}) => {
  const handleClose = () => {
    if (props.onClose) {
      props.onClose()
    } else {
      // Legacy fallback
      const { setVisible } = useModalContext()
      setVisible(false)
    }
  }
  
  return (
    <Modal onClose={handleClose}>
      <Modal.Header title="Search by barcode" onClose={handleClose} />
      <Modal.Content>
        {/* Content */}
      </Modal.Content>
      <Modal.Footer>
        <Button onClick={handleClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
}
```

## Complex Nested Modal Migration

### Before (Legacy Pattern)
```tsx
export function RecipeEditModal(props: RecipeEditModalProps) {
  const { visible, setVisible } = useModalContext()
  
  const [itemEditModalVisible, setItemEditModalVisible] = createSignal(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] = createSignal(false)

  return (
    <>
      {/* Nested item edit modal */}
      <Show when={itemEditModalVisible()}>
        <ModalContextProvider
          visible={() => itemEditModalVisible()}
          setVisible={setItemEditModalVisible}
        >
          <UnifiedItemEditModal />
        </ModalContextProvider>
      </Show>

      {/* Nested template search modal */}
      <ExternalTemplateSearchModal
        visible={templateSearchModalVisible}
        setVisible={setTemplateSearchModalVisible}
      />

      {/* Main modal */}
      <ModalContextProvider visible={visible} setVisible={setVisible}>
        <Modal>
          <Modal.Header title="Edit Recipe" />
          <Modal.Content>
            <RecipeEditContent
              onNewItem={() => setTemplateSearchModalVisible(true)}
              onEditItem={() => setItemEditModalVisible(true)}
            />
          </Modal.Content>
        </Modal>
      </ModalContextProvider>
    </>
  )
}
```

### After (Unified Modal System)
```tsx
export function RecipeEditModal(props: RecipeEditModalProps & {
  onClose?: () => void
}) {
  const { openModal, closeModal } = useUnifiedModal()
  
  const handleClose = () => {
    if (props.onClose) {
      props.onClose()
    } else {
      // Legacy fallback
      const { setVisible } = useModalContext()
      setVisible(false)
    }
  }

  const handleNewItem = () => {
    openEditModal(
      <TemplateSearchModal 
        onSelect={(item) => {
          // Handle item selection
          // Modal will auto-close via onSelect
        }}
      />,
      {
        title: 'Add New Item',
        targetName: props.recipe().name,
      }
    )
  }

  const handleEditItem = (item: Item) => {
    openEditModal(
      <UnifiedItemEditModal 
        item={() => item}
        onApply={(updatedItem) => {
          // Handle item update
          // Modal will auto-close via onApply
        }}
      />,
      {
        title: 'Edit Item',
        targetName: `${props.recipe().name} > ${item.name}`,
      }
    )
  }

  return (
    <Modal onClose={handleClose}>
      <Modal.Header title="Edit Recipe" onClose={handleClose} />
      <Modal.Content>
        <RecipeEditContent
          onNewItem={handleNewItem}
          onEditItem={handleEditItem}
        />
      </Modal.Content>
    </Modal>
  )
}
```

## Key Benefits of the New Pattern

### 1. Reduced Boilerplate
- **Before**: Every modal needs `createSignal` + `ModalContextProvider` wrapper  
- **After**: Single `openModal()` call

### 2. Centralized State Management
- **Before**: Multiple visibility signals scattered across components
- **After**: Single global modal state with automatic priority management

### 3. Better Performance
- **Before**: Multiple context providers creating separate reactive scopes
- **After**: Single global signal with optimized rendering

### 4. Cleaner API
- **Before**: Manual state synchronization between parent and child
- **After**: Callback-based approach with automatic lifecycle management

### 5. Built-in Features
- **Before**: Manual z-index management and priority handling
- **After**: Automatic layering, priority system, and modal management

## Migration Strategy

1. **Phase 1**: Update base modal components to accept `onClose` callbacks
2. **Phase 2**: Replace simple `ModalContextProvider` usages with `openModal()`
3. **Phase 3**: Migrate complex nested modal patterns
4. **Phase 4**: Remove legacy bridge components and context providers
5. **Phase 5**: Cleanup and optimization

## Helper Functions Available

- `openErrorModal(error, options)` - For error dialogs
- `openConfirmModal(message, options)` - For confirmations
- `openContentModal(content, options)` - For general content
- `openEditModal(content, options)` - For editing forms
- `closeModal(id)` - Close specific modal
- `closeAllModals()` - Emergency close all
- `hasOpenModals()` - Check if any modals are open

## Testing Considerations

When migrating modals, ensure to test:
- Modal opening and closing
- Nested modal interactions
- Escape key and outside click behavior
- Modal priority and layering
- Callback execution and state updates
- Error handling and edge cases