import {
  type Accessor,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  mergeProps,
  Show,
  untrack,
} from 'solid-js'

import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { updateChildInItem } from '~/modules/diet/unified-item/domain/childOperations'
import {
  isRecipeUnifiedItemManuallyEdited,
  syncRecipeUnifiedItemWithOriginal,
} from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  isFood,
  isGroup,
  isRecipe,
  type UnifiedItem,
  unifiedItemSchema,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { DownloadIcon } from '~/sections/common/components/icons/DownloadIcon'
import { PasteIcon } from '~/sections/common/components/icons/PasteIcon'
import { Modal } from '~/sections/common/components/Modal'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { useCopyPasteActions } from '~/sections/common/hooks/useCopyPasteActions'
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

  // Recipe synchronization
  const recipeRepository = createSupabaseRecipeRepository()
  const [originalRecipe] = createResource(
    () => {
      const currentItem = item()
      return isRecipe(currentItem) ? currentItem.reference.id : null
    },
    async (recipeId: number) => {
      try {
        return await recipeRepository.fetchRecipeById(recipeId)
      } catch (error) {
        console.warn('Failed to fetch recipe for sync:', error)
        return null
      }
    },
  )

  // Check if the recipe was manually edited
  const isManuallyEdited = createMemo(() => {
    const currentItem = item()
    const recipe = originalRecipe()

    if (
      !isRecipe(currentItem) ||
      recipe === null ||
      recipe === undefined ||
      originalRecipe.loading
    ) {
      return false
    }

    return isRecipeUnifiedItemManuallyEdited(currentItem, recipe)
  })

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

  const handleSyncWithOriginalRecipe = () => {
    const recipe = originalRecipe()
    if (!recipe) return

    const currentItem = item()
    const syncedItem = syncRecipeUnifiedItemWithOriginal(currentItem, recipe)
    setItem(syncedItem)
  }

  // Clipboard functionality
  const { handleCopy, handlePaste, hasValidPastableOnClipboard } =
    useCopyPasteActions({
      acceptedClipboardSchema: unifiedItemSchema,
      getDataToCopy: () => item(),
      onPaste: (data) => {
        setItem(data)
      },
    })

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
            {/* Clipboard Actions */}
            <div class="mb-4 flex justify-center gap-2">
              <button
                class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                onClick={handleCopy}
                title="Copiar item"
              >
                📋 Copiar
              </button>
              <Show when={hasValidPastableOnClipboard()}>
                <button
                  class="btn btn-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                  onClick={handlePaste}
                  title="Colar item"
                >
                  <div class="w-4 h-4">
                    <PasteIcon />
                  </div>
                  Colar
                </button>
              </Show>
            </div>

            {/* Toggle button for recipes */}
            <Show when={isRecipe(item())}>
              <div class="mb-4 flex justify-center items-center gap-3">
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

                {/* Sync button - only show if recipe was manually edited */}
                <Show when={isManuallyEdited() && originalRecipe()}>
                  <button
                    class="btn btn-sm bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                    onClick={handleSyncWithOriginalRecipe}
                    title="Sincronizar com receita original"
                  >
                    <div class="w-4 h-4">
                      <DownloadIcon />
                    </div>
                    Sincronizar
                  </button>
                </Show>
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
              clipboardActions={{
                onCopy: handleCopy,
                onPaste: handlePaste,
                hasValidPastableOnClipboard: hasValidPastableOnClipboard(),
              }}
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
