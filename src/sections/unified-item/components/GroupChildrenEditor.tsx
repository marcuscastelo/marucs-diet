import { type Accessor, For, type Setter, Show } from 'solid-js'

import { updateChildInItem } from '~/modules/diet/unified-item/domain/childOperations'
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

      <div class="mt-3 space-y-2">
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
    <div class="rounded-lg border border-gray-700 bg-gray-700 p-3 shadow">
      {/* Header com nome e id */}
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-medium text-white truncate">{props.child.name}</h4>
        <span class="text-xs text-gray-400 ml-2 shrink-0">
          #{props.child.id}
        </span>
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
  )
}
