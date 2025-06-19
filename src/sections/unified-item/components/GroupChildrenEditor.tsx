import { type Accessor, createSignal, For, type Setter, Show } from 'solid-js'

import { updateUnifiedItemQuantity } from '~/modules/diet/item/application/item'
import {
  addChildToItem,
  updateChildInItem,
} from '~/modules/diet/unified-item/domain/childOperations'
import {
  isGroup,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { useFloatField } from '~/sections/common/hooks/useField'
import { createDebug } from '~/shared/utils/createDebug'

const debug = createDebug()

export type GroupChildrenEditorProps = {
  item: Accessor<UnifiedItem>
  setItem: Setter<UnifiedItem>
}

export function GroupChildrenEditor(props: GroupChildrenEditorProps) {
  const children = () => {
    const item = props.item()
    return isGroup(item) ? item.reference.children : []
  }

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
      <p class="mt-4 text-gray-400">
        Itens no Grupo ({children().length}{' '}
        {children().length === 1 ? 'item' : 'itens'})
      </p>

      <div class="mt-3 space-y-3">
        <For each={children()}>
          {(child) => (
            <GroupChildEditor
              child={child}
              onQuantityChange={(newQuantity) =>
                updateChildQuantity(child.id, newQuantity)
              }
            />
          )}
        </For>
      </div>

      <Show when={children().length === 0}>
        <div class="mt-3 p-4 bg-gray-800 rounded text-center text-gray-500">
          Grupo vazio
        </div>
      </Show>

      <Show when={children().length > 1}>
        <div class="mt-4">
          <p class="text-gray-400 text-sm mb-2">Ações do Grupo</p>
          <div class="flex gap-2 p-3 bg-gray-800 rounded">
            <For each={[0.5, 1, 1.5, 2]}>
              {(multiplier) => (
                <button
                  class="btn btn-sm btn-outline flex-1"
                  onClick={() => applyMultiplierToAll(multiplier)}
                >
                  ×{multiplier}
                </button>
              )}
            </For>
            <span class="self-center text-gray-400 text-sm ml-2">
              Aplicar a todos
            </span>
          </div>
        </div>
      </Show>
    </>
  )
}

type GroupChildEditorProps = {
  child: UnifiedItem
  onQuantityChange: (newQuantity: number) => void
}

function GroupChildEditor(props: GroupChildEditorProps) {
  const quantityField = useFloatField(() => props.child.quantity, {
    decimalPlaces: 1,
    defaultValue: props.child.quantity,
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

  return (
    <div class="p-3 bg-gray-800 rounded border border-gray-600">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-medium text-white">{props.child.name}</h4>
        <span class="text-xs text-gray-400">#{props.child.id}</span>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex-1">
          <FloatInput
            field={quantityField}
            placeholder="Quantidade"
            class="input input-sm input-bordered w-full"
            onFieldCommit={handleQuantityChange}
            onFocus={(event) => {
              event.target.select()
            }}
          />
        </div>

        <span class="text-gray-400">g</span>

        <button class="btn btn-xs btn-outline" onClick={decrement}>
          -
        </button>

        <button class="btn btn-xs btn-outline" onClick={increment}>
          +
        </button>
      </div>

      <div class="flex gap-1 mt-2">
        <For each={getShortcuts()}>
          {(shortcut) => (
            <button
              class={`btn btn-xs flex-1 ${
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
  )
}
