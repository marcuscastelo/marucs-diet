import {
  type Accessor,
  createEffect,
  createSignal,
  mergeProps,
  Show,
  untrack,
} from 'solid-js'

import { updateChildInItem } from '~/modules/diet/unified-item/domain/childOperations'
import {
  isFood,
  isGroup,
  isRecipe,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { Modal } from '~/sections/common/components/Modal'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { useFloatField } from '~/sections/common/hooks/useField'
import { UnifiedItemEditBody } from '~/sections/unified-item/components/UnifiedItemEditBody'
import { UnsupportedItemMessage } from '~/sections/unified-item/components/UnsupportedItemMessage'
import { createDebug } from '~/shared/utils/createDebug'

const debug = createDebug()

export type UnifiedItemEditModalProps = {
  targetMealName: string
  targetNameColor?: string
  item: Accessor<UnifiedItem>
  macroOverflow: () => {
    enable: boolean
    originalItem?: UnifiedItem | undefined
  }
  onApply: (item: UnifiedItem) => void
  onCancel?: () => void
}

export const UnifiedItemEditModal = (_props: UnifiedItemEditModalProps) => {
  debug('[UnifiedItemEditModal] called', _props)
  const props = mergeProps({ targetNameColor: 'text-green-500' }, _props)
  const { setVisible } = useModalContext()

  const [item, setItem] = createSignal(untrack(() => props.item()))
  createEffect(() => setItem(props.item()))

  // Child editing modal state
  const [childEditModalVisible, setChildEditModalVisible] = createSignal(false)
  const [childBeingEdited, setChildBeingEdited] =
    createSignal<UnifiedItem | null>(null)

  // Recipe view mode: 'recipe' (normal) or 'group' (treat as group)
  const [recipeViewMode, setRecipeViewMode] = createSignal<'recipe' | 'group'>(
    'recipe',
  )

  const quantitySignal = () =>
    item().quantity === 0 ? undefined : item().quantity

  const quantityField = useFloatField(quantitySignal, {
    decimalPlaces: 0,
    // eslint-disable-next-line solid/reactivity
    defaultValue: item().quantity,
    minValue: 0.01,
  })

  const canApply = () => {
    debug('[UnifiedItemEditModal] canApply', item().quantity)
    return item().quantity > 0
  }

  const handleEditChild = (child: UnifiedItem) => {
    setChildBeingEdited(child)
    setChildEditModalVisible(true)
  }

  const handleChildModalApply = (updatedChild: UnifiedItem) => {
    // Update the child in the parent item using the domain function
    const currentItem = item()
    const updatedItem = updateChildInItem(
      currentItem,
      updatedChild.id,
      updatedChild,
    )
    setItem(updatedItem)
    setChildEditModalVisible(false)
    setChildBeingEdited(null)
  }

  return (
    <>
      <Modal class="border-2 border-white">
        <Modal.Header
          title={
            <span>
              Editando item em
              <span class={props.targetNameColor}>
                "{props.targetMealName}"
              </span>
            </span>
          }
        />
        <Modal.Content>
          <Show when={isFood(item()) || isRecipe(item()) || isGroup(item())}>
            {/* Toggle button for recipes */}
            <Show when={isRecipe(item())}>
              <div class="mb-4 flex justify-center">
                <div class="flex rounded-lg border border-gray-600 bg-gray-800 p-1">
                  <button
                    class={`px-3 py-1 rounded-md text-sm transition-colors ${
                      recipeViewMode() === 'recipe'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setRecipeViewMode('recipe')}
                  >
                    📖 Receita
                  </button>
                  <button
                    class={`px-3 py-1 rounded-md text-sm transition-colors ${
                      recipeViewMode() === 'group'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setRecipeViewMode('group')}
                  >
                    📦 Tratar como Grupo
                  </button>
                </div>
              </div>
            </Show>

            <UnifiedItemEditBody
              canApply={canApply()}
              item={item}
              setItem={setItem}
              macroOverflow={props.macroOverflow}
              quantityField={quantityField}
              onEditChild={handleEditChild}
              recipeViewMode={isRecipe(item()) ? recipeViewMode() : undefined}
            />
          </Show>
          <Show when={!isFood(item()) && !isRecipe(item()) && !isGroup(item())}>
            <UnsupportedItemMessage />
          </Show>
        </Modal.Content>
        <Modal.Footer>
          <button
            class="btn cursor-pointer uppercase"
            onClick={(e) => {
              debug('[UnifiedItemEditModal] Cancel clicked')
              e.preventDefault()
              e.stopPropagation()
              setVisible(false)
              props.onCancel?.()
            }}
          >
            Cancelar
          </button>
          <button
            class="btn cursor-pointer uppercase"
            disabled={
              !canApply() ||
              (!isFood(item()) && !isRecipe(item()) && !isGroup(item()))
            }
            onClick={(e) => {
              debug('[UnifiedItemEditModal] Apply clicked', item())
              e.preventDefault()
              console.debug(
                '[UnifiedItemEditModal] onApply - calling onApply with item.value=',
                item(),
              )
              props.onApply(item())
              setVisible(false)
            }}
          >
            Aplicar
          </button>
        </Modal.Footer>
      </Modal>

      {/* Child edit modal - nested modals for editing child items */}
      <Show when={childEditModalVisible() && childBeingEdited()}>
        {(child) => (
          <UnifiedItemEditModal
            targetMealName={`${props.targetMealName} > ${item().name}`}
            targetNameColor="text-orange-400"
            item={() => child()}
            macroOverflow={() => ({ enable: false })}
            onApply={handleChildModalApply}
            onCancel={() => {
              setChildEditModalVisible(false)
              setChildBeingEdited(null)
            }}
          />
        )}
      </Show>
    </>
  )
}
