import { type Accessor, createSignal, For, type Setter, Show } from 'solid-js'
import { z } from 'zod'

import {
  addChildToItem,
  updateChildInItem,
} from '~/modules/diet/unified-item/domain/childOperations'
import { validateItemHierarchy } from '~/modules/diet/unified-item/domain/validateItemHierarchy'
import {
  createUnifiedItem,
  isFoodItem,
  isGroupItem,
  isRecipeItem,
  type UnifiedItem,
  unifiedItemSchema,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { ClipboardActionButtons } from '~/sections/common/components/ClipboardActionButtons'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { useCopyPasteActions } from '~/sections/common/hooks/useCopyPasteActions'
import { useFloatField } from '~/sections/common/hooks/useField'
import { UnifiedItemEditModal } from '~/sections/unified-item/components/UnifiedItemEditModal'
import { UnifiedItemView } from '~/sections/unified-item/components/UnifiedItemView'
import { getItemTypeDisplay } from '~/sections/unified-item/utils/unifiedItemDisplayUtils'
import { createDebug } from '~/shared/utils/createDebug'
import { regenerateId } from '~/shared/utils/idUtils'

const debug = createDebug()

export type GroupChildrenEditorProps = {
  item: Accessor<UnifiedItem>
  setItem: Setter<UnifiedItem>
  onEditChild?: (child: UnifiedItem) => void
  onAddNewItem?: () => void
  showAddButton?: boolean
}

export function GroupChildrenEditor(props: GroupChildrenEditorProps) {
  const children = () => {
    const item = props.item()
    return isGroupItem(item) || isRecipeItem(item)
      ? item.reference.children
      : []
  }

  // Clipboard schema accepts UnifiedItem or array of UnifiedItems
  const acceptedClipboardSchema = unifiedItemSchema.or(
    z.array(unifiedItemSchema),
  )

  // Clipboard actions for children
  const { handleCopy, handlePaste, hasValidPastableOnClipboard } =
    useCopyPasteActions({
      acceptedClipboardSchema,
      getDataToCopy: () => children(),
      onPaste: (data) => {
        const itemsToAdd = Array.isArray(data) ? data : [data]

        let updatedItem = props.item()

        // Check if we need to transform a food item into a group
        if (isFoodItem(updatedItem) && itemsToAdd.length > 0) {
          // Transform the food item into a group with the original food as the first child
          const originalAsChild = createUnifiedItem({
            id: regenerateId(updatedItem).id, // New ID for the child
            name: updatedItem.name,
            quantity: updatedItem.quantity,
            reference: updatedItem.reference, // Keep the food reference
          })

          // Create new group with the original food as first child
          updatedItem = createUnifiedItem({
            id: updatedItem.id, // Keep the same ID for the parent
            name: updatedItem.name,
            quantity: updatedItem.quantity,
            reference: {
              type: 'group',
              children: [originalAsChild],
            },
          })
        }

        for (const newChild of itemsToAdd) {
          // Regenerate ID to avoid conflicts
          const childWithNewId = {
            ...newChild,
            id: regenerateId(newChild).id,
          }

          // Validate hierarchy to prevent circular references
          const tempItem = addChildToItem(updatedItem, childWithNewId)
          if (!validateItemHierarchy(tempItem)) {
            console.warn(
              `Skipping item ${childWithNewId.name} - would create circular reference`,
            )
            continue
          }

          updatedItem = tempItem
        }

        props.setItem(updatedItem)
      },
    })

  const updateChildQuantity = (childId: number, newQuantity: number) => {
    debug('[GroupChildrenEditor] updateChildQuantity', { childId, newQuantity })

    const updatedItem = updateChildInItem(props.item(), childId, {
      quantity: newQuantity,
    })

    props.setItem(updatedItem)
  }

  const applyMultiplierToAll = (multiplier: number) => {
    debug('[GroupChildrenEditor] applyMultiplierToAll', { multiplier })

    let updatedItem = props.item()

    for (const child of children()) {
      const newQuantity = child.quantity * multiplier
      updatedItem = updateChildInItem(updatedItem, child.id, {
        quantity: newQuantity,
      })
    }

    props.setItem(updatedItem)
  }

  return (
    <>
      <div class="flex items-center justify-between mt-4">
        <p class="text-gray-400">
          Itens no Grupo ({children().length}{' '}
          {children().length === 1 ? 'item' : 'itens'})
        </p>

        {/* Clipboard Actions */}
        <ClipboardActionButtons
          canCopy={children().length > 0}
          canPaste={hasValidPastableOnClipboard()}
          canClear={false} // We don't need clear functionality here
          onCopy={handleCopy}
          onPaste={handlePaste}
          onClear={() => {}} // Empty function since canClear is false
        />
      </div>

      <div class="mt-3 space-y-2">
        <For each={children()}>
          {(child) => (
            <GroupChildEditor
              child={child}
              onQuantityChange={(newQuantity) =>
                updateChildQuantity(child.id, newQuantity)
              }
              onEditChild={props.onEditChild}
            />
          )}
        </For>
      </div>

      <Show when={children().length === 0}>
        <div class="mt-3 p-4 rounded-lg border border-gray-700 bg-gray-700 text-center text-gray-500">
          Grupo vazio
        </div>
      </Show>

      <Show when={children().length > 1}>
        <div class="mt-4">
          <p class="text-gray-400 text-sm mb-2">Ações do Grupo</p>
          <div class="rounded-lg border border-gray-700 bg-gray-700 p-3">
            <div class="flex gap-1">
              <For each={[0.5, 1, 1.5, 2]}>
                {(multiplier) => (
                  <button
                    class="btn btn-sm btn-primary flex-1"
                    onClick={() => applyMultiplierToAll(multiplier)}
                  >
                    ×{multiplier}
                  </button>
                )}
              </For>
            </div>
            <p class="text-xs text-gray-400 mt-2 text-center">
              Aplicar a todos os itens
            </p>
          </div>
        </div>
      </Show>

      {/* Add new item button */}
      <Show when={props.showAddButton === true && props.onAddNewItem}>
        <div class="mt-4">
          <button
            class="btn btn-sm bg-green-600 hover:bg-green-700 text-white w-full flex items-center justify-center gap-2"
            onClick={() => props.onAddNewItem?.()}
            title="Adicionar novo item ao grupo"
          >
            ➕ Adicionar Item
          </button>
        </div>
      </Show>
    </>
  )
}

type GroupChildEditorProps = {
  child: UnifiedItem
  onQuantityChange: (newQuantity: number) => void
  onEditChild?: (child: UnifiedItem) => void
}

function GroupChildEditor(props: GroupChildEditorProps) {
  const [childEditModalVisible, setChildEditModalVisible] = createSignal(false)
  const typeDisplay = () => getItemTypeDisplay(props.child)

  const quantityField = useFloatField(() => props.child.quantity, {
    decimalPlaces: 1,
    minValue: 0.1,
  })

  // Atualiza quando o field muda
  const handleQuantityChange = () => {
    const newQuantity = quantityField.value() ?? 0.1
    if (newQuantity !== props.child.quantity) {
      props.onQuantityChange(newQuantity)
    }
  }

  const increment = () => {
    const newValue = (quantityField.value() ?? 0) + 10
    quantityField.setRawValue(newValue.toString())
    props.onQuantityChange(newValue)
  }

  const decrement = () => {
    const newValue = Math.max(0.1, (quantityField.value() ?? 0) - 10)
    quantityField.setRawValue(newValue.toString())
    props.onQuantityChange(newValue)
  }

  const handleEditChild = () => {
    if (props.onEditChild) {
      props.onEditChild(props.child)
    } else {
      // Fallback: open modal locally
      setChildEditModalVisible(true)
    }
  }

  return (
    <>
      <UnifiedItemView
        item={() => props.child}
        handlers={{ onEdit: handleEditChild }}
      />

      {/* Modal for editing child items */}
      <Show when={childEditModalVisible()}>
        <ModalContextProvider
          visible={childEditModalVisible}
          setVisible={setChildEditModalVisible}
        >
          <UnifiedItemEditModal
            targetMealName="Grupo"
            targetNameColor="text-orange-400"
            item={() => props.child}
            macroOverflow={() => ({ enable: false })}
            onApply={(updatedChild) => {
              // Update the child in the parent
              props.onQuantityChange(updatedChild.quantity)
              setChildEditModalVisible(false)
            }}
            onCancel={() => setChildEditModalVisible(false)}
          />
        </ModalContextProvider>
      </Show>
    </>
  )
}
