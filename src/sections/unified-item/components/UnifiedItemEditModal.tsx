import { type Accessor, type Setter, Show } from 'solid-js'

import {
  isFood,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { Modal } from '~/sections/common/components/Modal'
import { calcUnifiedItemMacros } from '~/shared/utils/macroMath'

export type UnifiedItemEditModalProps = {
  item: Accessor<UnifiedItem>
  setItem: Setter<UnifiedItem>
  targetMealName: string
  onSaveItem: (item: UnifiedItem) => void
  onRefetch: () => void
  mode?: 'edit' | 'read-only' | 'summary'
}

export function UnifiedItemEditModal(props: UnifiedItemEditModalProps) {
  return (
    <Modal>
      <div class="bg-gray-800 p-6 rounded-lg">
        <h2 class="text-xl font-bold mb-4">
          Editar Item - {props.targetMealName}
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              value={props.item().name}
              onInput={(e) => {
                const newItem = { ...props.item(), name: e.currentTarget.value }
                props.setItem(newItem)
              }}
              class="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500"
              disabled={props.mode === 'read-only'}
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Quantidade (g)</label>
            <input
              type="number"
              value={props.item().quantity}
              onInput={(e) => {
                const newItem = {
                  ...props.item(),
                  quantity: Number(e.currentTarget.value),
                }
                props.setItem(newItem)
              }}
              class="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500"
              disabled={props.mode === 'read-only'}
            />
          </div>

          <Show when={isFood(props.item())}>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">
                  Carboidratos
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={calcUnifiedItemMacros(props.item()).carbs}
                  onInput={(e) => {
                    if (isFood(props.item())) {
                      const foodItem = props.item() as Extract<
                        UnifiedItem,
                        { reference: { type: 'food' } }
                      >
                      const newItem = {
                        ...foodItem,
                        macros: {
                          ...foodItem.macros,
                          carbs: Number(e.currentTarget.value),
                        },
                      }
                      props.setItem(newItem)
                    }
                  }}
                  class="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500"
                  disabled={props.mode === 'read-only'}
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Proteínas</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcUnifiedItemMacros(props.item()).protein}
                  onInput={(e) => {
                    if (isFood(props.item())) {
                      const foodItem = props.item() as Extract<
                        UnifiedItem,
                        { reference: { type: 'food' } }
                      >
                      const newItem = {
                        ...foodItem,
                        macros: {
                          ...foodItem.macros,
                          protein: Number(e.currentTarget.value),
                        },
                      }
                      props.setItem(newItem)
                    }
                  }}
                  class="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500"
                  disabled={props.mode === 'read-only'}
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Gorduras</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcUnifiedItemMacros(props.item()).fat}
                  onInput={(e) => {
                    if (isFood(props.item())) {
                      const foodItem = props.item() as Extract<
                        UnifiedItem,
                        { reference: { type: 'food' } }
                      >
                      const newItem = {
                        ...foodItem,
                        macros: {
                          ...foodItem.macros,
                          fat: Number(e.currentTarget.value),
                        },
                      }
                      props.setItem(newItem)
                    }
                  }}
                  class="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500"
                  disabled={props.mode === 'read-only'}
                />
              </div>
            </div>
          </Show>

          <Show when={!isFood(props.item())}>
            <div class="text-gray-400 text-sm">
              As macros deste item são calculadas automaticamente com base nos
              filhos.
            </div>
          </Show>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
            onClick={() => props.onRefetch()}
          >
            Cancelar
          </button>
          <button
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            onClick={() => props.onSaveItem(props.item())}
            disabled={props.mode === 'read-only'}
          >
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  )
}
