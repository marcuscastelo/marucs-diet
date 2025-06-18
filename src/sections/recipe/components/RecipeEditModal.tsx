import { Accessor, createEffect, createSignal } from 'solid-js'
import { untrack } from 'solid-js'

import { createItem, type Item } from '~/modules/diet/item/domain/item'
import {
  isSimpleSingleGroup,
  type ItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  addItemsToRecipe,
  removeItemFromRecipe,
  updateItemInRecipe,
} from '~/modules/diet/recipe/domain/recipeOperations'
import {
  isTemplateItemFood,
  isTemplateItemRecipe,
} from '~/modules/diet/template-item/domain/templateItem'
import { showError } from '~/modules/toast/application/toastManager'
import { Modal } from '~/sections/common/components/Modal'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import {
  ModalContextProvider,
  useModalContext,
} from '~/sections/common/context/ModalContext'
import { ExternalItemEditModal } from '~/sections/food-item/components/ExternalItemEditModal'
import {
  RecipeEditContent,
  RecipeEditHeader,
} from '~/sections/recipe/components/RecipeEditView'
import { RecipeEditContextProvider } from '~/sections/recipe/context/RecipeEditContext'
import { ExternalTemplateSearchModal } from '~/sections/search/components/ExternalTemplateSearchModal'
import { handleValidationError } from '~/shared/error/errorHandler'

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

  const [selectedItem, setSelectedItem] = createSignal<Item | null>(null)

  const impossibleItem = createItem({
    name: 'IMPOSSIBLE ITEM',
    reference: 0,
  })

  const [itemEditModalVisible, setItemEditModalVisible] = createSignal(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    createSignal(false)

  const handleNewItemGroup = (newGroup: ItemGroup) => {
    console.debug('onNewItemGroup', newGroup)

    if (!isSimpleSingleGroup(newGroup)) {
      // TODO:   Handle non-simple groups on handleNewItemGroup
      handleValidationError('Cannot add complex groups to recipes', {
        component: 'RecipeEditModal',
        operation: 'handleNewItemGroup',
        additionalData: { groupType: 'complex', groupId: newGroup.id },
      })
      showError(
        'Não é possível adicionar grupos complexos a receitas, por enquanto.',
      )
      return
    }

    const updatedRecipe = addItemsToRecipe(recipe(), newGroup.items)

    console.debug(
      'handleNewItemGroup: applying',
      JSON.stringify(updatedRecipe, null, 2),
    )

    setRecipe(updatedRecipe)
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
      <ExternalItemEditModal
        visible={itemEditModalVisible}
        setVisible={setItemEditModalVisible}
        item={() => selectedItem() ?? impossibleItem}
        targetName={recipe().name}
        onApply={(item) => {
          // Only handle regular Items, not RecipeItems
          if (!isTemplateItemFood(item)) {
            console.warn('Cannot edit RecipeItems in recipe')
            return
          }

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

      <ExternalTemplateSearchModal
        visible={templateSearchModalVisible}
        setVisible={setTemplateSearchModalVisible}
        onRefetch={props.onRefetch}
        targetName={recipe().name}
        onNewItemGroup={handleNewItemGroup}
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
                  if (isTemplateItemRecipe(item)) {
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
      <button
        class="btn-error btn cursor-pointer uppercase mr-auto"
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
      </button>
      <button
        class="btn cursor-pointer uppercase"
        onClick={(e) => {
          e.preventDefault()
          setVisible(false)
          props.onCancel?.()
        }}
      >
        Cancelar
      </button>
      <button
        class="btn cursor-pointer uppercase"
        onClick={(e) => {
          e.preventDefault()
          props.onApply()
          setVisible(false)
        }}
      >
        Aplicar
      </button>
    </>
  )
}
