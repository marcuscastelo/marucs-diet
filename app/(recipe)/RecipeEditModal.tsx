'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { FoodItem, createFoodItem } from '@/model/foodItemModel'
import Modal, { ModalActions, ModalRef } from '../(modals)/Modal'
import { Recipe, createRecipe } from '@/model/recipeModel'
import RecipeEditView from './RecipeEditView'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import Show from '../Show'
import { ModalContextProvider } from '../(modals)/ModalContext'

export type RecipeEditModalProps = {
  show?: boolean
  modalId: string
  recipe: Recipe | null
  onSaveRecipe: (recipe: Recipe) => void
  onCancel?: () => void
  onVisibilityChange?: (isShowing: boolean) => void
}

// eslint-disable-next-line react/display-name
const RecipeEditModal = forwardRef(
  (
    {
      show = false,
      modalId,
      recipe: initialRecipe,
      onSaveRecipe,
      onCancel,
      onVisibilityChange,
    }: RecipeEditModalProps,
    ref: React.Ref<ModalRef>,
  ) => {
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

    // TODO: Change other modals modalRef variable to selfModalRef on other files
    const selfModalRef = useRef<ModalRef>(null)
    // TODO: Rename foodItemEditModalRef to foodItemAddModalRef on other files (and here)
    const foodItemEditModalRef = useRef<ModalRef>(null)

    const handleSetShowing = useCallback(
      (isShowing: boolean) => {
        onVisibilityChange?.(isShowing)
      },
      [onVisibilityChange],
    )

    useEffect(() => {
      if (initialRecipe) {
        setRecipe(initialRecipe)
      }
    }, [initialRecipe])

    useEffect(() => {
      if (selectedFoodItem) {
        foodItemEditModalRef.current?.showModal()
      } else {
        foodItemEditModalRef.current?.close()
      }
    }, [selectedFoodItem])

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

    return (
      <>
        <Show when={selectedFoodItem !== null}>
          <ModalContextProvider
            visible={selectedFoodItem !== null}
            onVisibilityChange={(visible) => {
              if (!visible) {
                setSelectedFoodItem(null)
              }
            }}
          >
            <FoodItemEditModal
              modalId="RECIPES_EDIT_MODAL:FOOD_ITEM_ADD_MODAL"
              ref={foodItemEditModalRef}
              foodItem={selectedFoodItem ?? impossibleFoodItem}
              targetName={recipe?.name ?? 'LOADING RECIPE'}
              onApply={(foodItem) => {
                if (!recipe) return

                setRecipe(
                  (recipe) =>
                    recipe && {
                      ...recipe,
                      items: [
                        ...recipe.items.filter(
                          (item) => item.id !== foodItem.id,
                        ),
                        foodItem,
                      ],
                    },
                )
                // setSelectedFoodItem(null)
              }}
            />
          </ModalContextProvider>
        </Show>
        <ModalContextProvider
          visible={show}
          onVisibilityChange={(...args) => {
            handleSetShowing(...args)
          }}
        >
          <Modal
            modalId={modalId}
            ref={selfModalRef}
            onSubmit={() => recipe && onSaveRecipe(recipe)}
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

                      // TODO: Move confirm up to parent (also with all other confirmations)
                      // TODO: Replace confirm with a modal
                      if (
                        confirm('Tem certeza que deseja excluir este item?')
                      ) {
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
        </ModalContextProvider>
      </>
    )
  },
)

export default RecipeEditModal
