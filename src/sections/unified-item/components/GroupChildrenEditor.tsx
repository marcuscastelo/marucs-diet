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
import { FloatInput } from '~/sections/common/components/FloatInput'
import { EditIcon } from '~/sections/common/components/icons/EditIcon'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { useCopyPasteActions } from '~/sections/common/hooks/useCopyPasteActions'
import { useFloatField } from '~/sections/common/hooks/useField'
import { UnifiedItemEditModal } from '~/sections/unified-item/components/UnifiedItemEditModal'
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
    return isGroupItem(item) || isRecipeItem(item) ? item.reference.children : []
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

function getTypeIcon(item: UnifiedItem) {
  if (isFoodItem(item)) {
    return '🍽️'
  } else if (isRecipeItem(item)) {
    return '📖'
  } else if (isGroupItem(item)) {
    return '📦'
  }
  return '❓'
}

function getTypeText(item: UnifiedItem) {
  if (isFoodItem(item)) {
    return 'alimento'
  } else if (isRecipeItem(item)) {
    return 'receita'
  } else if (isGroupItem(item)) {
    return 'grupo'
  }
  return 'desconhecido'
}

function GroupChildEditor(props: GroupChildEditorProps) {
  const [childEditModalVisible, setChildEditModalVisible] = createSignal(false)

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

  // Shortcuts baseados no tipo de alimento
  const getShortcuts = () => {
    // Para carnes, sugerir porções maiores
    if (
      props.child.name.toLowerCase().includes('carne') ||
      props.child.name.toLowerCase().includes('frango') ||
      props.child.name.toLowerCase().includes('peixe')
    ) {
      return [100, 150, 200, 250]
    }
    // Para vegetais, porções menores
    if (
      props.child.name.toLowerCase().includes('salada') ||
      props.child.name.toLowerCase().includes('verdura') ||
      props.child.name.toLowerCase().includes('legume')
    ) {
      return [25, 50, 75, 100]
    }
    // Padrão geral
    return [50, 100, 150, 200]
  }

  const canEditChild = () => {
    return isRecipeItem(props.child) || isGroupItem(props.child)
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
      <div class="rounded-lg border border-gray-700 bg-gray-700 p-3 shadow">
        {/* Header com nome, tipo e id */}
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div class="flex items-center gap-1 shrink-0">
              <span
                class="text-base cursor-help"
                title={getTypeText(props.child)}
              >
                {getTypeIcon(props.child)}
              </span>
            </div>
            <h4 class="font-medium text-white truncate">{props.child.name}</h4>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-xs text-gray-400">#{props.child.id}</span>
            <Show when={canEditChild()}>
              <button
                class="p-1 hover:bg-gray-600 rounded transition-colors"
                onClick={handleEditChild}
                title={`Editar ${getTypeText(props.child)}`}
              >
                <EditIcon class="w-4 h-4 text-blue-400 hover:text-blue-300" />
              </button>
            </Show>
          </div>
        </div>

        {/* Controles principais */}
        <div class="flex w-full justify-between gap-1 mb-3">
          <div class="flex-1 relative">
            <FloatInput
              field={quantityField}
              placeholder="Quantidade"
              class={`input-bordered input bg-gray-800 border-gray-300 w-full`}
              onFieldCommit={handleQuantityChange}
              onFocus={(event) => {
                event.target.select()
              }}
            />
          </div>

          <span class="text-gray-400 self-center mx-2">g</span>

          {/* Botões de incremento/decremento - seguindo padrão QuantityControls */}
          <div class="flex shrink gap-1">
            <div
              class="btn-primary btn-xs btn cursor-pointer uppercase h-full w-10 px-6 text-4xl text-red-600"
              onClick={decrement}
            >
              -
            </div>
            <div
              class="btn-primary btn-xs btn cursor-pointer uppercase h-full w-10 px-6 text-4xl text-green-400"
              onClick={increment}
            >
              +
            </div>
          </div>
        </div>

        {/* Shortcuts - seguindo padrão QuantityShortcuts */}
        <div class="flex gap-1">
          <For each={getShortcuts()}>
            {(shortcut) => (
              <button
                class={`btn btn-xs flex-1 cursor-pointer uppercase ${
                  Math.abs((quantityField.value() ?? 0) - shortcut) < 0.1
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
                onClick={() => {
                  quantityField.setRawValue(shortcut.toString())
                  props.onQuantityChange(shortcut)
                }}
              >
                {shortcut}g
              </button>
            )}
          </For>
        </div>
      </div>

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
