'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FoodItem, createFoodItem } from '@/model/foodItemModel'
import Modal, { ModalActions } from '../(modals)/Modal'
import { Recipe, createRecipe } from '@/model/recipeModel'
import RecipeEditView from './RecipeEditView'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import { ModalContextProvider, useModalContext } from '../(modals)/ModalContext'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import { TemplateItem } from '@/model/templateItemModel'
import { TemplateSearchModal } from '../templateSearch/TemplateSearchModal'
import { ItemGroup, isSimpleSingleGroup } from '@/model/itemGroupModel'
import { RecipeEditor } from '@/utils/data/recipeEditor'
import {
  Signal,
  effect,
  useSignal,
  useSignalEffect,
} from '@preact/signals-react'

export type RecipeEditModalProps = {
  show?: boolean
  recipe: Recipe | null // TODO: After #159 is done, remove recipe nullability and check if something breaks
  onSaveRecipe: (recipe: Recipe) => void
  onRefetch: () => void
  onCancel?: () => void
  onVisibilityChange?: (isShowing: boolean) => void
}

export function RecipeEditModal({
  recipe: initialRecipe,
  onSaveRecipe,
  onCancel,
  onRefetch,
}: RecipeEditModalProps) {
  const { visible } = useModalContext()

  const recipe = useSignal(
    initialRecipe ??
      createRecipe({
        name: 'New Recipe',
        items: [],
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
      createRecipe({ name: 'Error: Recipe cannot be null!', items: [] })
  }, [recipe, initialRecipe])

  useSignalEffect(() => {
    if (!selectedFoodItem.value) {
      foodItemEditModalVisible.value = false
    }
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
        foodItem={selectedFoodItem.value ?? impossibleFoodItem}
        targetName={recipe.value?.name ?? 'LOADING RECIPE'}
        onApply={(foodItem) => {
          if (!recipe) return

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
          if (!recipe) return

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
          header={<Header recipe={recipe.value} />}
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
              onDelete={() => alert('TODO: delete recipe')}
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
  foodItem: FoodItem
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
    // onRefetch()
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

function Header({ recipe }: { recipe: Recipe | undefined }) {
  return (
    <h3 className="text-lg font-bold text-white">
      Editando receita
      <span className="text-blue-500">
        {' '}
        &quot;
        {recipe?.name ?? 'LOADING RECIPE'}
        &quot;{' '}
      </span>
    </h3>
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
  if (!recipe) return null

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
