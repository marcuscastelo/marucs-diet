'use client'

import { useEffect, useState } from 'react'
import { FoodItem, createFoodItem } from '@/model/foodItemModel'
import Modal, { ModalActions } from '../(modals)/Modal'
import { Recipe, createRecipe } from '@/model/recipeModel'
import RecipeEditView from './RecipeEditView'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import { ModalContextProvider, useModalContext } from '../(modals)/ModalContext'
import { useConfirmModalContext } from '@/context/confirmModal.context'

export type RecipeEditModalProps = {
  show?: boolean
  recipe: Recipe | null
  onSaveRecipe: (recipe: Recipe) => void
  onCancel?: () => void
  onVisibilityChange?: (isShowing: boolean) => void
}

const RecipeEditModal = ({
  recipe: initialRecipe,
  onSaveRecipe,
  onCancel,
}: RecipeEditModalProps) => {
  const { visible, onSetVisible } = useModalContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  const [recipe, setRecipe] = useState<Recipe>(
    initialRecipe ??
      createRecipe({
        name: 'New Recipe',
        items: [],
      }),
  )

  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(
    null,
  )

  const impossibleFoodItem = createFoodItem({
    name: 'IMPOSSIBLE FOOD ITEM',
    reference: 0,
  })

  const [foodItemEditModalVisible, setFoodItemEditModalVisible] =
    useState(false)

  useEffect(() => {
    if (initialRecipe) {
      setRecipe(initialRecipe)
    }
  }, [initialRecipe])

  useEffect(() => {
    if (selectedFoodItem) {
      setFoodItemEditModalVisible(true)
    } else {
      setFoodItemEditModalVisible(false)
    }
  }, [selectedFoodItem])

  return (
    <>
      {foodItemEditModalVisible && (
        <ModalContextProvider
          visible={foodItemEditModalVisible}
          onSetVisible={(visible) => {
            // TODO: Implement onClose and onOpen to reduce code duplication
            if (!visible) {
              setSelectedFoodItem(null)
            }
            setFoodItemEditModalVisible(visible)
          }}
        >
          <FoodItemEditModal
            foodItem={selectedFoodItem ?? impossibleFoodItem}
            targetName={recipe?.name ?? 'LOADING RECIPE'}
            onApply={(foodItem) => {
              if (!recipe) return

              setRecipe(
                (recipe) =>
                  recipe && {
                    ...recipe,
                    items: recipe.items.map((item) =>
                      item.id === foodItem.id
                        ? {
                            ...item,
                            quantity: foodItem.quantity,
                          }
                        : item,
                    ),
                  },
              )
              setSelectedFoodItem(null)
            }}
          />
        </ModalContextProvider>
      )}

      <ModalContextProvider visible={visible} onSetVisible={onSetVisible}>
        <Modal
          header={
            <h3 className="text-lg font-bold text-white">
              Editando receita
              <span className="text-blue-500">
                {' '}
                &quot;
                {recipe?.name ?? 'LOADING RECIPE'}
                &quot;{' '}
              </span>
            </h3>
          }
          body={
            recipe && (
              <RecipeEditView
                recipe={recipe}
                header={
                  <RecipeEditView.Header
                    onUpdateRecipe={(recipe) => {
                      setRecipe(recipe)
                    }}
                  />
                }
                content={
                  <RecipeEditView.Content
                    onEditItem={(item) => setSelectedFoodItem(item)}
                  />
                }
                actions={
                  <RecipeEditView.Actions
                    // TODO: Treat recursive recipe
                    // TODO: Implement onAddItem for RecipeEditModal
                    onNewItem={() => alert('TODO: onAddItem')}
                  />
                }
              />
            )
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

                    showConfirmModal({
                      title: 'Excluir item',
                      message: 'Tem certeza que deseja excluir este item?',
                      actions: [
                        {
                          text: 'Cancelar',
                          onClick: () => undefined,
                        },
                        {
                          text: 'Excluir',
                          primary: true,
                          onClick: () => {
                            // handleDeleteItem?.(id)
                            // TODO: Implement handleDeleteItem for RecipeEditModal
                            alert('TODO: handleDeleteItem')
                          },
                        },
                      ],
                    })
                  }}
                >
                  Excluir
                </button>
              }
              <button
                className="btn"
                onClick={(e) => {
                  e.preventDefault()
                  onSetVisible(false)
                  onCancel?.()
                }}
              >
                Cancelar
              </button>
              <button
                className="btn"
                onClick={(e) => {
                  e.preventDefault()
                  onSaveRecipe(recipe)
                  onSetVisible(false)
                }}
              >
                Aplicar
              </button>
            </ModalActions>
          }
        />
      </ModalContextProvider>
    </>
  )
}

export default RecipeEditModal
