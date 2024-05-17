import {
  type FoodItem,
  createFoodItem,
} from '~/modules/diet/food-item/domain/foodItem'
import { Modal, ModalActions } from '~/sections/common/components/Modal'
import { type Recipe, createRecipe } from '~/modules/diet/recipe/domain/recipe'
import RecipeEditView, {
  RecipeEditContent,
  RecipeEditHeader,
} from '~/sections/recipe/components/RecipeEditView'
import { FoodItemEditModal } from '~/sections/food-item/components/FoodItemEditModal'
import {
  ModalContextProvider,
  useModalContext,
} from '~/sections/common/context/ModalContext'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { TemplateSearchModal } from '~/sections/search/components/TemplateSearchModal'
import {
  type ItemGroup,
  isSimpleSingleGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { RecipeEditor } from '~/legacy/utils/data/recipeEditor'

import { currentUserId } from '~/modules/user/application/user'
import {
  type Accessor,
  createEffect,
  createSignal,
  type Setter,
  Show,
} from 'solid-js'
import { createMirrorSignal } from '~/sections/common/hooks/createMirrorSignal'

export type RecipeEditModalProps = {
  show?: boolean
  recipe: Recipe | null // TODO: After #159 is done, remove recipe nullability and check if something breaks
  onSaveRecipe: (recipe: Recipe) => void
  onRefetch: () => void
  onCancel?: () => void
  onDelete: (recipeId: Recipe['id']) => void
  onVisibilityChange?: (isShowing: boolean) => void
}

export function RecipeEditModal(props: RecipeEditModalProps) {
  const { visible, setVisible } = useModalContext()
  const userId = currentUserId()

  const [recipe, setRecipe] = createMirrorSignal(
    () =>
      props.recipe ??
      createRecipe({
        name: 'New Recipe',
        items: [],
        owner: userId,
      }),
  )

  const [selectedFoodItem, setSelectedFoodItem] = createSignal<FoodItem | null>(
    null,
  )

  const impossibleFoodItem = createFoodItem({
    name: 'IMPOSSIBLE FOOD ITEM',
    reference: 0,
  })

  const [foodItemEditModalVisible, setFoodItemEditModalVisible] =
    createSignal(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    createSignal(false)

  createEffect(() => {
    // TODO: Replace foodItemEditModalVisible with a derived signal
    setFoodItemEditModalVisible(selectedFoodItem() !== null)
  })

  createEffect(() => {
    if (!foodItemEditModalVisible()) {
      setSelectedFoodItem(null)
    }
  })

  return (
    <>
      <ExternalFoodItemEditModal
        visible={foodItemEditModalVisible}
        setVisible={setFoodItemEditModalVisible}
        foodItem={() => selectedFoodItem() ?? impossibleFoodItem}
        targetName={recipe()?.name ?? 'LOADING RECIPE'}
        onApply={(foodItem) => {
          if (recipe() === null) return

          const recipeEditor = new RecipeEditor(recipe())

          const newRecipe = recipeEditor
            .editItem(foodItem.id, (itemEditor) => {
              itemEditor?.setQuantity(foodItem.quantity)
            })
            .finish()

          setRecipe(newRecipe)
          setSelectedFoodItem(null)
        }}
        onDelete={(itemId) => {
          const recipeEditor = new RecipeEditor(recipe())

          const newRecipe = recipeEditor.deleteItem(itemId).finish()

          setRecipe(newRecipe)
          setSelectedFoodItem(null)
        }}
      />

      <ExternalTemplateSearchModal
        visible={templateSearchModalVisible}
        setVisible={setTemplateSearchModalVisible}
        onRefetch={props.onRefetch}
        recipe={recipe}
        setRecipe={setRecipe}
      />

      <ModalContextProvider visible={visible} setVisible={setVisible}>
        <Modal
          class="border-2 border-cyan-600"
          // TODO: Add barcode button and handle barcode scan
          body={
            <Body
              recipe={recipe}
              setRecipe={setRecipe}
              selectedFoodItem={selectedFoodItem}
              setSelectedFoodItem={setSelectedFoodItem}
              onSearchNewItem={() => setTemplateSearchModalVisible(true)}
            />
          }
          actions={
            <Actions
              onApply={() => {
                props.onSaveRecipe(recipe())
              }}
              onCancel={props.onCancel}
              onDelete={() => {
                props.onDelete(recipe().id)
              }}
            />
          }
        />
      </ModalContextProvider>
    </>
  )
}

function ExternalFoodItemEditModal(props: {
  foodItem: Accessor<FoodItem>
  targetName: string
  onApply: (item: TemplateItem) => void
  onDelete: (itemId: TemplateItem['id']) => void
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
}) {
  // TODO: Determine whether to use <Show when/> for modals in general or just remove all Shows
  return (
    <Show when={props.visible()}>
      <ModalContextProvider
        visible={props.visible}
        setVisible={props.setVisible}
      >
        <FoodItemEditModal
          foodItem={props.foodItem}
          targetName={props.targetName}
          onApply={props.onApply}
          onDelete={props.onDelete}
        />
      </ModalContextProvider>
    </Show>
  )
}

// TODO: This component is duplicated between RecipeEditModal and ItemGroupEditModal, must be refactored (maybe global)
function ExternalTemplateSearchModal(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onRefetch: () => void
  recipe: Accessor<Recipe>
  setRecipe: Setter<Recipe>
}) {
  const handleNewItemGroup = (newGroup: ItemGroup) => {
    console.debug('onNewItemGroup', newGroup)

    if (!isSimpleSingleGroup(newGroup)) {
      // TODO: Handle non-simple groups on onNewFoodItem
      console.error('TODO: Handle non-simple groups')
      alert('TODO: Handle non-simple groups') // TODO: Change all alerts with ConfirmModal
      return
    }

    const newRecipe = new RecipeEditor(props.recipe())
      .addItems(newGroup.items)
      .finish()

    console.debug('onNewFoodItem: applying', JSON.stringify(newRecipe, null, 2))

    props.setRecipe(newRecipe)
  }

  const handleFinishSearch = () => {
    props.setVisible(false)
  }

  createEffect(() => {
    // TODO: [RecipeEditModal] Refetch on modal open instead of close?
    if (!props.visible()) {
      props.onRefetch()
    }
  })

  return (
    <ModalContextProvider visible={props.visible} setVisible={props.setVisible}>
      <TemplateSearchModal
        targetName={props.recipe()?.name ?? 'ERRO: Receita não especificada'}
        onFinish={handleFinishSearch}
        onNewItemGroup={handleNewItemGroup}
      />
    </ModalContextProvider>
  )
}

function Body(props: {
  recipe: Accessor<Recipe>
  setRecipe: Setter<Recipe>
  selectedFoodItem: Accessor<FoodItem | null>
  setSelectedFoodItem: Setter<FoodItem | null>
  onSearchNewItem: () => void
}) {
  return (
    <RecipeEditView
      recipe={props.recipe}
      setRecipe={props.setRecipe}
      header={
        <RecipeEditHeader
          onUpdateRecipe={(newRecipe) => {
            console.debug('[RecipeEditModal] onUpdateRecipe: ', newRecipe)
            props.setRecipe(newRecipe)
          }}
        />
      }
      content={
        <RecipeEditContent
          onNewItem={() => {
            props.onSearchNewItem()
          }}
          onEditItem={(item) => {
            // TODO: Allow user to edit recipe inside recipe
            if (item.__type === 'RecipeItem') {
              alert(
                'Ainda não é possível editar receitas dentro de receitas! Funcionalidade em desenvolvimento',
              )
              return
            }

            props.setSelectedFoodItem(item)
          }}
        />
      }
    />
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
    <ModalActions>
      <button
        class="btn-error btn mr-auto"
        onClick={(e) => {
          e.preventDefault()

          showConfirmModal({
            title: 'Excluir item',
            body: 'Tem certeza que deseja excluir este item?',
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
                },
              },
            ],
          })
        }}
      >
        Excluir
      </button>
      <button
        class="btn"
        onClick={(e) => {
          e.preventDefault()
          setVisible(false)
          props.onCancel?.()
        }}
      >
        Cancelar
      </button>
      <button
        class="btn"
        onClick={(e) => {
          e.preventDefault()
          props.onApply()
          setVisible(false)
        }}
      >
        Aplicar
      </button>
    </ModalActions>
  )
}
