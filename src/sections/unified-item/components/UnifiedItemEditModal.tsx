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
import {
  addChildToItem,
  updateChildInItem,
} from '~/modules/diet/unified-item/domain/childOperations'
import {
  isRecipeUnifiedItemManuallyEdited,
  syncRecipeUnifiedItemWithOriginal,
} from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  asGroupItem,
  createUnifiedItem,
  isFoodItem,
  isGroupItem,
  isRecipeItem,
  type UnifiedItem,
  unifiedItemSchema,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { DownloadIcon } from '~/sections/common/components/icons/DownloadIcon'
import { Modal } from '~/sections/common/components/Modal'
import {
  ModalContextProvider,
  useModalContext,
} from '~/sections/common/context/ModalContext'
import { useCopyPasteActions } from '~/sections/common/hooks/useCopyPasteActions'
import { useFloatField } from '~/sections/common/hooks/useField'
import { ExternalTemplateSearchModal } from '~/sections/search/components/ExternalTemplateSearchModal'
import { UnifiedItemEditBody } from '~/sections/unified-item/components/UnifiedItemEditBody'
import { UnsupportedItemMessage } from '~/sections/unified-item/components/UnsupportedItemMessage'
import { createDebug } from '~/shared/utils/createDebug'
import { generateId } from '~/shared/utils/idUtils'

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
  onAddNewItem?: () => void
  showAddItemButton?: boolean
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

  // Template search modal state
  const [templateSearchVisible, setTemplateSearchVisible] = createSignal(false)

  const [viewMode, setViewMode] = createSignal<'normal' | 'group'>('normal')

  createEffect(() => {
    if (viewMode() === 'group') {
      const currentItem = untrack(item)
      if (isFoodItem(currentItem)) {
        // Create a copy of the original item with a new ID for the child
        const originalAsChild = createUnifiedItem({
          id: generateId(), // New ID for the child
          name: currentItem.name,
          quantity: currentItem.quantity,
          reference: currentItem.reference, // Keep the food reference
        })

        const groupItem = createUnifiedItem({
          id: currentItem.id, // Keep the same ID for the parent
          name: currentItem.name,
          quantity: currentItem.quantity,
          reference: {
            type: 'group',
            children: [originalAsChild],
          },
        })
        setItem(groupItem)
      }
    } else if (viewMode() === 'normal') {
      const currentItem = untrack(item)
      if (!isGroupItem(currentItem)) {
        return
      }
      const firstChild = currentItem.reference.children[0]
      if (firstChild === undefined) {
        return
      }

      if (
        isGroupItem(currentItem) &&
        currentItem.reference.children.length === 1
      ) {
        setItem(createUnifiedItem({ ...firstChild }))
      }
    }
  })

  // Recipe synchronization
  const recipeRepository = createSupabaseRecipeRepository()
  const [originalRecipe] = createResource(
    () => {
      const currentItem = item()
      return isRecipeItem(currentItem) ? currentItem.reference.id : null
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
      !isRecipeItem(currentItem) ||
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
          <Show
            when={
              isFoodItem(item()) || isRecipeItem(item()) || isGroupItem(item())
            }
          >
            {/* Toggle button for recipes */}
            <Show
              when={
                isRecipeItem(item()) ||
                isFoodItem(item()) ||
                asGroupItem(item())?.reference.children.length === 1
              }
            >
              <div class="mb-4 flex justify-center items-center gap-3 ">
                <div class="flex rounded-lg border border-gray-600 w-full bg-gray-800 p-1">
                  <button
                    class={`px-3 py-1 rounded-md text-sm transition-colors flex-1 ${
                      viewMode() === 'normal'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setViewMode('normal')}
                  >
                    <Show when={isRecipeItem(item())}>📖 Receita</Show>
                    <Show when={!isRecipeItem(item())}>🍽️ Alimento</Show>
                  </button>
                  <button
                    class={`px-3 py-1 rounded-md text-sm transition-colors flex-1 ${
                      viewMode() === 'group'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setViewMode('group')}
                  >
                    📦 Tratar como Grupo
                  </button>
                </div>

                {/* Sync button - only show if recipe was manually edited */}
                <Show when={isManuallyEdited() && originalRecipe()}>
                  <div
                    class="btn btn-sm btn-ghost text-white rounded-md flex items-center gap-1"
                    onClick={handleSyncWithOriginalRecipe}
                    title="Sincronizar com receita original"
                  >
                    <DownloadIcon />
                  </div>
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
              viewMode={viewMode()}
              clipboardActions={{
                onCopy: handleCopy,
                onPaste: handlePaste,
                hasValidPastableOnClipboard: hasValidPastableOnClipboard(),
              }}
              onAddNewItem={() => setTemplateSearchVisible(true)}
              showAddItemButton={props.showAddItemButton}
            />
          </Show>
          <Show
            when={
              !isFoodItem(item()) &&
              !isRecipeItem(item()) &&
              !isGroupItem(item())
            }
          >
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
              (!isFoodItem(item()) &&
                !isRecipeItem(item()) &&
                !isGroupItem(item()))
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
          <ModalContextProvider
            visible={childEditModalVisible}
            setVisible={setChildEditModalVisible}
          >
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
          </ModalContextProvider>
        )}
      </Show>

      {/* Template search modal for adding new items */}
      <Show when={templateSearchVisible()}>
        <ExternalTemplateSearchModal
          visible={templateSearchVisible}
          setVisible={setTemplateSearchVisible}
          targetName={item().name}
          onRefetch={() => {
            // Refresh functionality (not used in this context)
          }}
          onNewUnifiedItem={(newUnifiedItem) => {
            // Add the new item directly to the current group
            if (isGroupItem(item())) {
              const updatedItem = addChildToItem(item(), {
                ...newUnifiedItem,
                id: generateId(), // Ensure unique ID
              })
              setItem(updatedItem)
            } else {
              // If not a group, convert to group and add the item
              const currentItem = item()
              const groupItem = createUnifiedItem({
                id: currentItem.id,
                name: currentItem.name,
                quantity: currentItem.quantity,
                reference: {
                  type: 'group',
                  children: [
                    createUnifiedItem({
                      ...currentItem,
                      id: generateId(), // New ID for the original item as child
                    }),
                    {
                      ...newUnifiedItem,
                      id: generateId(), // New ID for the new item
                    },
                  ],
                },
              })
              setItem(groupItem)
            }

            // Close the template search modal
            setTemplateSearchVisible(false)
            return null
          }}
        />
      </Show>
    </>
  )
}
