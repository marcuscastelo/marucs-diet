'use client'

import { useEffect } from 'react'
import {
  FoodItem,
  createFoodItem,
} from '@/modules/diet/food-item/domain/foodItem'
import Modal, { ModalActions } from '@/sections/common/components/Modal'
import { Recipe, createRecipe } from '@/modules/diet/recipe/domain/recipe'
import RecipeEditView from '@/sections/recipe/components/RecipeEditView'
import FoodItemEditModal from '@/sections/food-item/components/FoodItemEditModal'
import {
  ModalContextProvider,
  useModalContext,
} from '@/sections/common/context/ModalContext'
import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { TemplateItem } from '@/modules/diet/template-item/domain/templateItem'
import { TemplateSearchModal } from '@/sections/search/components/TemplateSearchModal'
import {
  ItemGroup,
  isSimpleSingleGroup,
} from '@/modules/diet/item-group/domain/itemGroup'
import { RecipeEditor } from '@/legacy/utils/data/recipeEditor'
import {
  ReadonlySignal,
  Signal,
  computed,
  useSignal,
  useSignalEffect,
} from '@preact/signals-react'
import { currentUserId } from '@/modules/user/application/user'

export type RecipeEditModalProps = {
  show?: boolean
  recipe: Recipe | null // TODO: After #159 is done, remove recipe nullability and check if something breaks
  onSaveRecipe: (recipe: Recipe) => void
  onRefetch: () => void
  onCancel?: () => void
  onDelete: (recipeId: Recipe['id']) => void
  onVisibilityChange?: (isShowing: boolean) => void
}

export function RecipeEditModal({
  recipe: initialRecipe,
  onSaveRecipe,
  onDelete,
  onCancel,
  onRefetch,
}: RecipeEditModalProps) {
  const { visible } = useModalContext()
  const userId = currentUserId.value

  if (userId === null) {
    throw new Error('User is null')
  }

  const recipe = useSignal(
    initialRecipe ??
      createRecipe({
        name: 'New Recipe',
        items: [],
        owner: userId,
      }),
  )

  const selectedFoodItem = useSignal<FoodItem | null>(null)

  const impossibleFoodItem = createFoodItem({
    name: 'IMPOSSIBLE FOOD ITEM',
    reference: 0,
  })

  const foodItemEditModalVisible = useSignal(false)
  const templateSearchModalVisible = useSignal(false)

  useEffect(() => {
    recipe.value =
      initialRecipe ??
      createRecipe({
        name: 'Error: Recipe cannot be null!',
        items: [],
        owner: userId,
      })
  }, [recipe, initialRecipe, userId])

  useSignalEffect(() => {
    foodItemEditModalVisible.value = selectedFoodItem.value !== null
  })

  useSignalEffect(() => {
    if (!foodItemEditModalVisible.value) {
      selectedFoodItem.value = null
    }
  })

  return (
    <>
      <ExternalFoodItemEditModal
        visible={foodItemEditModalVisible}
        foodItem={computed(() => selectedFoodItem.value ?? impossibleFoodItem)}
        targetName={recipe.value?.name ?? 'LOADING RECIPE'}
        onApply={(foodItem) => {
          if (recipe.value === null) return

          const recipeEditor = new RecipeEditor(recipe.value)

          const newRecipe = recipeEditor
            .editItem(foodItem.id, (itemEditor) => {
              itemEditor?.setQuantity(foodItem.quantity)
            })
            .finish()

          recipe.value = newRecipe
          selectedFoodItem.value = null
        }}
        onDelete={(itemId) => {
          const recipeEditor = new RecipeEditor(recipe.value)

          const newRecipe = recipeEditor.deleteItem(itemId).finish()

          recipe.value = newRecipe
          selectedFoodItem.value = null
        }}
      />

      <ExternalTemplateSearchModal
        visible={templateSearchModalVisible}
        onRefetch={onRefetch}
        recipe={recipe}
      />

      <ModalContextProvider visible={visible}>
        <Modal
          className="border-2 border-cyan-600"
          // TODO: Add barcode button and handle barcode scan
          body={
            <Body
              recipe={recipe}
              selectedFoodItem={selectedFoodItem}
              onSearchNewItem={() => (templateSearchModalVisible.value = true)}
            />
          }
          actions={
            <Actions
              onApply={() => onSaveRecipe(recipe.value)}
              onCancel={onCancel}
              onDelete={() => onDelete(recipe.value.id)}
            />
          }
        />
      </ModalContextProvider>
    </>
  )
}

function ExternalFoodItemEditModal({
  foodItem,
  targetName,
  onApply,
  onDelete,
  visible,
}: {
  foodItem: ReadonlySignal<FoodItem>
  targetName: string
  onApply: (item: TemplateItem) => void
  onDelete: (itemId: TemplateItem['id']) => void
  visible: Signal<boolean>
}) {
  // TODO: Determine whether to early return from modals in general or just remove all ifs
  if (!visible) return

  return (
    <ModalContextProvider visible={visible}>
      <FoodItemEditModal
        foodItem={foodItem}
        targetName={targetName}
        onApply={onApply}
        onDelete={onDelete}
      />
    </ModalContextProvider>
  )
}

// TODO: This component is duplicated between RecipeEditModal and ItemGroupEditModal, must be refactored (maybe global)
function ExternalTemplateSearchModal({
  visible,
  onRefetch,
  recipe,
}: {
  visible: Signal<boolean>
  onRefetch: () => void
  recipe: Signal<Recipe>
}) {
  const handleNewItemGroup = async (newGroup: ItemGroup) => {
    console.debug('onNewItemGroup', newGroup)

    if (!isSimpleSingleGroup(newGroup)) {
      // TODO: Handle non-simple groups on onNewFoodItem
      console.error('TODO: Handle non-simple groups')
      alert('TODO: Handle non-simple groups') // TODO: Change all alerts with ConfirmModal
      return
    }

    const newRecipe = new RecipeEditor(recipe.value)
      .addItems(newGroup.items)
      .finish()

    console.debug('onNewFoodItem: applying', JSON.stringify(newRecipe, null, 2))

    recipe.value = newRecipe
  }

  const handleFinishSearch = () => {
    visible.value = false
  }

  useSignalEffect(() => {
    if (!visible.value) {
      onRefetch()
    }
  })

  return (
    <ModalContextProvider visible={visible}>
      <TemplateSearchModal
        targetName={recipe.value?.name ?? 'ERRO: Receita não especificada'}
        onFinish={handleFinishSearch}
        onNewItemGroup={handleNewItemGroup}
      />
    </ModalContextProvider>
  )
}

function Body({
  recipe,
  selectedFoodItem,
  onSearchNewItem,
}: {
  recipe: Signal<Recipe>
  selectedFoodItem: Signal<FoodItem | null>
  onSearchNewItem: () => void
}) {
  return (
    <RecipeEditView
      recipe={recipe}
      header={
        <RecipeEditView.Header
          onUpdateRecipe={(newRecipe) => {
            console.debug(`[RecipeEditModal] onUpdateRecipe: `, newRecipe)
            recipe.value = newRecipe
          }}
        />
      }
      content={
        <RecipeEditView.Content
          onNewItem={() => onSearchNewItem()}
          onEditItem={(item) => {
            // TODO: Allow user to edit recipe inside recipe
            if (item.__type === 'RecipeItem') {
              alert(
                'Ainda não é possível editar receitas dentro de receitas! Funcionalidade em desenvolvimento',
              )
              return
            }

            selectedFoodItem.value = item
          }}
        />
      }
    />
  )
}

function Actions({
  onApply,
  onDelete,
  onCancel,
}: {
  onApply: () => void
  onDelete: () => void
  onCancel?: () => void
}) {
  const { visible } = useModalContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <ModalActions>
      <button
        className="btn-error btn mr-auto"
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
                  onDelete()
                },
              },
            ],
          })
        }}
      >
        Excluir
      </button>
      <button
        className="btn"
        onClick={(e) => {
          e.preventDefault()
          visible.value = false
          onCancel?.()
        }}
      >
        Cancelar
      </button>
      <button
        className="btn"
        onClick={(e) => {
          e.preventDefault()
          onApply()
          visible.value = false
        }}
      >
        Aplicar
      </button>
    </ModalActions>
  )
}
