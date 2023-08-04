'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import FoodItemView from '../(foodItem)/FoodItemView'
import { FoodItem } from '@/model/foodItemModel'
import { Food } from '@/model/foodModel'
import { useFavoriteFoods } from '@/redux/features/userSlice'
import Modal, { ModalActions, ModalRef } from '../(modals)/modal'
import { Recipe } from '@/model/recipeModel'
import FoodItemListView from '../(foodItem)/FoodItemListView'
import RecipeView from './RecipeView'
import MealItemAddModal from '../MealItemAddModal'
import Show from '../Show'
import { MealData } from '@/model/mealModel'

export type RecipeEditModalProps = {
  modalId: string
  recipe: Recipe
  show?: boolean
  onSaveRecipe: (recipe: Recipe) => void
  onCancel?: () => void
  onVisibilityChange?: (isShowing: boolean) => void
}

// eslint-disable-next-line react/display-name
const RecipeEditModal = forwardRef(
  (
    {
      modalId,
      recipe: initialRecipe,
      onSaveRecipe,
      onCancel,
      onVisibilityChange,
    }: RecipeEditModalProps,
    ref: React.Ref<ModalRef>,
  ) => {
    const [recipe, setRecipe] = useState<Recipe>(initialRecipe)
    const [itemToEdit, setItemToEdit] = useState<FoodItem | null>(null)

    // TODO: Change other modals modalRef variable to selfModalRef on other files
    const selfModalRef = useRef<ModalRef>(null)
    // TODO: Rename mealItemAddModalRef to foodItemAddModalRef on other files (and here)
    const mealItemAddModalRef = useRef<ModalRef>(null)

    const handleSetShowing = useCallback(
      (isShowing: boolean) => {
        onVisibilityChange?.(isShowing)
      },
      [onVisibilityChange],
    )

    useEffect(() => {
      if (itemToEdit) {
        mealItemAddModalRef.current?.showModal()
      } else {
        mealItemAddModalRef.current?.close()
      }
    }, [itemToEdit])

    useImperativeHandle(ref, () => ({
      showModal: () => {
        selfModalRef.current?.showModal()
        handleSetShowing(true)
      },
      close: () => {
        selfModalRef.current?.close()
        handleSetShowing(false)
      },
    }))

    useEffect(() => {
      selfModalRef.current?.showModal()
      handleSetShowing(true)
    }, [handleSetShowing]) // TODO : remove after POC

    return (
      <>
        <Show when={itemToEdit !== null}>
          <MealItemAddModal
            modalId="RECIPES_EDIT_MODAL:FOOD_ITEM_ADD_MODAL"
            ref={mealItemAddModalRef}
            itemData={itemToEdit!} // TODO: <Show> should handle this with a type guard
            meal={recipe as unknown as MealData} // TODO: Make MealItemAddModal not depend on MealData anymore
            onApply={(foodItem) => {
              setRecipe((recipe) => ({
                ...recipe,
                items: [
                  ...recipe.items.filter((item) => item.id !== foodItem.id),
                  foodItem,
                ],
              }))
              setItemToEdit(null)
            }}
          />
        </Show>
        <Modal
          modalId={modalId}
          ref={selfModalRef}
          onSubmit={() => onSaveRecipe(recipe)}
          header={
            <h3 className="text-lg font-bold text-white">
              Editando receita
              <span className="text-blue-500"> &quot;{recipe.name}&quot; </span>
            </h3>
          }
          onVisibilityChange={handleSetShowing}
          body={
            <RecipeView
              recipe={recipe}
              header={
                <RecipeView.Header
                  onUpdateRecipe={(recipe) => {
                    setRecipe(recipe)
                  }}
                />
              }
              content={
                <RecipeView.Content
                  onEditItem={(item) => setItemToEdit(item)}
                />
              }
              actions={
                <RecipeView.Actions
                  // TODO: Treat recursive recipe
                  onNewItem={() => alert('TODO: onAddItem')}
                />
              }
            />
            // TODO: Add barcode button and handle barcode scan
          }
          actions={
            <ModalActions>
              {/* if there is a button in form, it will close the modal */}
              {
                <button
                  className="btn-error btn mr-auto"
                  onClick={(e) => {
                    e.preventDefault()

                    // TODO: Move confirm up to parent (also with all other confirmations)
                    // TODO: Replace confirm with a modal
                    if (confirm('Tem certeza que deseja excluir este item?')) {
                      // handleDeleteItem?.(id)
                      alert('TODO: handleDeleteItem')
                    }
                  }}
                >
                  Excluir
                </button>
              }
              <button
                className="btn"
                onClick={(e) => {
                  e.preventDefault()
                  selfModalRef.current?.close()
                  onCancel?.()
                }}
              >
                Cancelar
              </button>
              <button
                className="btn"
                onClick={(e) => {
                  e.preventDefault()
                  // onSaveRecipe(createMealItemData())
                  alert('TODO: onSaveRecipe')
                }}
              >
                Aplicar
              </button>
            </ModalActions>
          }
        />
      </>
    )
  },
)

export default RecipeEditModal
