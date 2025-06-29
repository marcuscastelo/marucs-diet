import { Accessor, createEffect, createSignal, Show } from 'solid-js'
import { untrack } from 'solid-js'

import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  addItemToRecipe,
  updateItemInRecipe,
} from '~/modules/diet/recipe/domain/recipeOperations'
import { TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { unifiedItemToItem } from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  createUnifiedItem,
  isRecipeItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { showError } from '~/modules/toast/application/toastManager'
import { Button } from '~/sections/common/components/buttons/Button'
import { Modal } from '~/sections/common/components/Modal'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import {
  ModalContextProvider,
  useModalContext,
} from '~/sections/common/context/ModalContext'
import {
  RecipeEditContent,
  RecipeEditHeader,
} from '~/sections/recipe/components/RecipeEditView'
import { RecipeEditContextProvider } from '~/sections/recipe/context/RecipeEditContext'
import { ExternalTemplateSearchModal } from '~/sections/search/components/ExternalTemplateSearchModal'
import { UnifiedItemEditModal } from '~/sections/unified-item/components/UnifiedItemEditModal'
import { handleValidationError } from '~/shared/error/errorHandler'
import { generateId } from '~/shared/utils/idUtils'

export type RecipeEditModalProps = {
  show?: boolean
  recipe: Accessor<Recipe>
  onSaveRecipe: (recipe: Recipe) => void
  onRefetch: () => void
  onCancel?: () => void
  onDelete: (recipeId: Recipe['id']) => void
  onVisibilityChange?: (isShowing: boolean) => void
}

export function RecipeEditModal(props: RecipeEditModalProps) {
  const { visible, setVisible } = useModalContext()

  const [recipe, setRecipe] = createSignal(untrack(() => props.recipe()))

  createEffect(() => {
    setRecipe(props.recipe())
  })

  const [selectedItem, setSelectedItem] = createSignal<TemplateItem | null>(
    null,
  )

  const impossibleItem = createUnifiedItem({
    id: generateId(),
    name: 'IMPOSSIBLE ITEM',
    quantity: 1,
    reference: {
      type: 'food',
      id: -1,
      macros: { carbs: 0, protein: 0, fat: 0 },
    },
  })

  const [itemEditModalVisible, setItemEditModalVisible] = createSignal(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    createSignal(false)

  const handleNewUnifiedItem = (newItem: UnifiedItem) => {
    console.debug('onNewUnifiedItem', newItem)

    // Convert UnifiedItem to Item for adding to recipe
    try {
      // Only food items can be directly converted to Items for recipes
      if (newItem.reference.type !== 'food') {
        handleValidationError('Cannot add non-food items to recipes', {
          component: 'RecipeEditModal',
          operation: 'handleNewUnifiedItem',
          additionalData: {
            itemType: newItem.reference.type,
            itemId: newItem.id,
          },
        })
        showError(
          'Não é possível adicionar itens que não sejam alimentos a receitas.',
        )
        return
      }

      const item = unifiedItemToItem(newItem)
      const updatedRecipe = addItemToRecipe(recipe(), item)

      console.debug(
        'handleNewUnifiedItem: applying',
        JSON.stringify(updatedRecipe, null, 2),
      )

      setRecipe(updatedRecipe)
    } catch (error) {
      console.error('Error converting UnifiedItem to Item:', error)
      showError('Erro ao adicionar item à receita.')
    }
  }

  createEffect(() => {
    // TODO:   Replace itemEditModalVisible with a derived signal
    setItemEditModalVisible(selectedItem() !== null)
  })

  createEffect(() => {
    if (!itemEditModalVisible()) {
      setSelectedItem(null)
    }
  })

  return (
    <>
      <Show when={itemEditModalVisible()}>
        <ModalContextProvider
          visible={() => itemEditModalVisible()}
          setVisible={setItemEditModalVisible}
        >
          <UnifiedItemEditModal
            item={() => selectedItem() ?? impossibleItem}
            targetMealName={recipe().name}
            macroOverflow={() => ({ enable: false })}
            onApply={(unifiedItem) => {
              // Convert back to Item for recipe operations
              const item = unifiedItemToItem(unifiedItem)
              const updatedItem: Item = { ...item, quantity: item.quantity }
              const updatedRecipe = updateItemInRecipe(
                recipe(),
                item.id,
                updatedItem,
              )

              setRecipe(updatedRecipe)
              setSelectedItem(null)
            }}
          />
        </ModalContextProvider>
      </Show>

      <ExternalTemplateSearchModal
        visible={templateSearchModalVisible}
        setVisible={setTemplateSearchModalVisible}
        onRefetch={props.onRefetch}
        targetName={recipe().name}
        onNewUnifiedItem={handleNewUnifiedItem}
      />

      <ModalContextProvider visible={visible} setVisible={setVisible}>
        <Modal class="border-2 border-cyan-600">
          <RecipeEditContextProvider
            recipe={recipe}
            setRecipe={setRecipe}
            onSaveRecipe={props.onSaveRecipe}
          >
            <Modal.Header
              title={
                <RecipeEditHeader
                  onUpdateRecipe={(newRecipe) => {
                    console.debug(
                      '[RecipeEditModal] onUpdateRecipe: ',
                      newRecipe,
                    )
                    setRecipe(newRecipe)
                  }}
                />
              }
            />
            <Modal.Content>
              <RecipeEditContent
                onNewItem={() => {
                  setTemplateSearchModalVisible(true)
                }}
                onEditItem={(item) => {
                  // TODO: Allow user to edit recipes inside recipes
                  if (isRecipeItem(item)) {
                    showError(
                      'Ainda não é possível editar receitas dentro de receitas! Funcionalidade em desenvolvimento',
                    )
                    return
                  }

                  setSelectedItem(item)
                }}
              />
            </Modal.Content>
            <Modal.Footer>
              <Actions
                onApply={() => {
                  props.onSaveRecipe(recipe())
                }}
                onCancel={props.onCancel}
                onDelete={() => {
                  props.onDelete(recipe().id)
                }}
              />
            </Modal.Footer>
          </RecipeEditContextProvider>
        </Modal>
      </ModalContextProvider>
    </>
  )
}

function Actions(props: {
  onApply: () => void
  onDelete: () => void
  onCancel?: () => void
}) {
  const { setVisible } = useModalContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <>
      <Button
        class="btn-error mr-auto"
        onClick={(e) => {
          e.preventDefault()
          showConfirmModal({
            title: 'Excluir receita',
            body: 'Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.',
            actions: [
              {
                text: 'Cancelar',
                onClick: () => undefined,
              },
              {
                text: 'Excluir',
                primary: true,
                onClick: () => {
                  props.onDelete()
                  setVisible(false)
                },
              },
            ],
          })
        }}
      >
        Excluir
      </Button>
      <Button
        onClick={(e) => {
          e.preventDefault()
          setVisible(false)
          props.onCancel?.()
        }}
      >
        Cancelar
      </Button>
      <Button
        onClick={(e) => {
          e.preventDefault()
          props.onApply()
          setVisible(false)
        }}
      >
        Aplicar
      </Button>
    </>
  )
}
