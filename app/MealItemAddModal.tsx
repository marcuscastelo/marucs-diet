'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import FoodItemView from './(foodItem)/FoodItemView'
import { FoodItem } from '@/model/foodItemModel'
import { Food } from '@/model/foodModel'
import { MealData } from '@/model/mealModel'
import { useFavoriteFoods, useUser } from '@/redux/features/userSlice'
import Modal, { ModalActions, ModalRef } from './(modals)/modal'
import { mockFood, mockItem } from './test/unit/(mock)/mockData'
import RecipeEditModal from './(recipe)/RecipeEditModal'
import { Recipe, createRecipe } from '@/model/recipeModel'
import { Loadable } from '@/utils/loadable'
import { searchRecipeById, listRecipes } from '@/controllers/recipes'

const RECIPE_EDIT_MODAL_ID = 'meal-item-add-modal:self:recipe-edit-modal'

export type MealItemAddModalProps = {
  modalId: string
  meal: MealData | null
  itemData: (Partial<FoodItem> & { food: Food }) | null
  onApply: (item: FoodItem) => void
  onCancel?: () => void
  onDelete?: (itemId: FoodItem['id']) => void
  onVisibilityChange?: (isShowing: boolean) => void
}

// eslint-disable-next-line react/display-name
const MealItemAddModal = forwardRef(
  (
    {
      modalId,
      meal,
      itemData,
      onApply,
      onCancel,
      onDelete,
      onVisibilityChange,
    }: MealItemAddModalProps,
    ref: React.Ref<ModalRef>,
  ) => {
    const [showing, setShowing_] = useState(false)
    const [quantity, setQuantity] = useState(
      itemData?.quantity?.toString() ?? '',
    )
    const [id, setId] = useState(itemData?.id ?? Math.random()) // TODO: Proper ID generation on other module or backend
    const canAdd = quantity !== '' && Number(quantity) > 0
    const quantityRef = useRef<HTMLInputElement>(null)

    const selfModalRef = useRef<ModalRef>(null)
    const recipeEditModalRef = useRef<ModalRef>(null)

    const [quantityFieldDisabled, setQuantityFieldDisabled] = useState(true)

    const [recipe, setRecipe] = useState<Loadable<Recipe | null>>({
      loading: true,
    })

    const { isFoodFavorite, setFoodAsFavorite } = useFavoriteFoods()

    const handleSetShowing = (isShowing: boolean) => {
      setShowing_(isShowing)
      onVisibilityChange?.(isShowing)
    }

    useEffect(() => {
      if (!showing) {
        setQuantity('')
        setId(Math.round(Math.random() * 1000000))
        setQuantityFieldDisabled(true)
        return
      }

      const timeout = setTimeout(() => {
        setQuantityFieldDisabled(false)
      }, 100)

      return () => {
        clearTimeout(timeout)
      }
    }, [showing])

    useEffect(() => {
      if (itemData?.quantity !== undefined) {
        setQuantity(itemData?.quantity.toString())
      }

      if (itemData?.id !== undefined) {
        setId(itemData?.id)
      }
    }, [itemData?.quantity, itemData?.id])

    useEffect(() => {
      if (itemData?.food.recipeId === undefined) {
        setRecipe({ loading: false, data: null })
      } else {
        setRecipe({ loading: true })
        searchRecipeById(itemData?.food.recipeId).then((recipe) => {
          setRecipe({ loading: false, data: recipe })
        })
      }
    }, [itemData?.food.recipeId])

    useEffect(() => {
      setQuantityFieldDisabled(true)
      const timeout = setTimeout(() => {
        setQuantityFieldDisabled(false)
      }, 1000)

      return () => {
        clearTimeout(timeout)
      }
    }, [itemData?.quantity, itemData?.id])

    const increment = () =>
      setQuantity((old) => (Number(old ?? '0') + 1).toString())
    const decrement = () =>
      setQuantity((old) => Math.max(0, Number(old ?? '0') - 1).toString())

    const [currentHoldTimeout, setCurrentHoldTimeout] =
      useState<NodeJS.Timeout>()
    const [currentHoldInterval, setCurrentHoldInterval] =
      useState<NodeJS.Timeout>()

    const holdRepeatStart = (action: () => void) => {
      setCurrentHoldTimeout(
        setTimeout(() => {
          setCurrentHoldInterval(
            setInterval(() => {
              action()
            }, 100),
          )
        }, 500),
      )
    }

    const holdRepeatStop = () => {
      if (currentHoldTimeout) {
        clearTimeout(currentHoldTimeout)
      }

      if (currentHoldInterval) {
        clearInterval(currentHoldInterval)
      }
    }

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

    const createMealItemData = (): FoodItem => ({
      id,
      quantity: Number(quantity),
      food: itemData?.food ?? mockFood({ name: 'THIS IS A BUG' }), // TODO: Remove mock food
    })

    return (
      <>
        {itemData?.food.name.toString()}
        {itemData?.food.id.toString()}
        {itemData?.food.recipeId?.toString() ?? 'NO RECIPE ID'}
        {recipe.loading.valueOf().toString()}
        {(!recipe.loading && JSON.stringify(recipe.data, null, 2)) ||
          'NO RECIPE DATA'}
        <RecipeEditModal
          modalId={RECIPE_EDIT_MODAL_ID}
          ref={recipeEditModalRef}
          recipe={(!recipe.loading && recipe.data) || null}
          onSaveRecipe={async () => alert('TODO: Save recipe')}
        />
        <Modal
          modalId={modalId}
          ref={selfModalRef}
          onSubmit={() => onApply(createMealItemData())}
          header={
            <h3 className="text-lg font-bold text-white">
              Novo item em
              <span className="text-green-500">
                {' '}
                &quot;{meal?.name ?? 'MEAL NOT LOADED'}&quot;{' '}
              </span>
            </h3>
          }
          onVisibilityChange={handleSetShowing}
          body={
            <>
              <p className="mt-1 text-gray-400">Atalhos</p>
              <div className="mt-1 flex w-full">
                <div
                  className="btn-primary btn-sm btn flex-1"
                  onClick={() => setQuantity('10')}
                >
                  10g
                </div>
                <div
                  className="btn-primary btn-sm btn ml-1 flex-1"
                  onClick={() => setQuantity('20')}
                >
                  20g
                </div>
                <div
                  className="btn-primary btn-sm btn ml-1 flex-1"
                  onClick={() => setQuantity('30')}
                >
                  30g
                </div>
                <div
                  className="btn-primary btn-sm btn ml-1 flex-1"
                  onClick={() => setQuantity('40')}
                >
                  40g
                </div>
                <div
                  className="btn-primary btn-sm btn ml-1 flex-1"
                  onClick={() => setQuantity('50')}
                >
                  50g
                </div>
              </div>
              <div className="mt-1 flex w-full">
                <div
                  className="btn-primary btn-sm btn flex-1"
                  onClick={() => setQuantity('100')}
                >
                  100g
                </div>
                <div
                  className="btn-primary btn-sm btn ml-1 flex-1"
                  onClick={() => setQuantity('150')}
                >
                  150g
                </div>
                <div
                  className="btn-primary btn-sm btn ml-1 flex-1"
                  onClick={() => setQuantity('200')}
                >
                  200g
                </div>
                <div
                  className="btn-primary btn-sm btn ml-1 flex-1"
                  onClick={() => setQuantity('250')}
                >
                  250g
                </div>
                <div
                  className="btn-primary btn-sm btn ml-1 flex-1"
                  onClick={() => setQuantity('300')}
                >
                  300g
                </div>
              </div>
              <div className="mt-3 flex w-full justify-between gap-1">
                <div className="my-1 flex flex-1 justify-around">
                  <input
                    style={{ width: '100%' }}
                    disabled={quantityFieldDisabled}
                    value={quantity}
                    ref={quantityRef}
                    onChange={(e) =>
                      setQuantity(e.target.value.replace(/[^0-9]/, ''))
                    }
                    type="number"
                    placeholder="Quantidade (gramas)"
                    className={`input-bordered  input mt-1  border-gray-300 bg-gray-800 ${
                      !canAdd ? 'input-error border-red-500' : ''
                    }`}
                  />
                </div>
                <div className="my-1 ml-1 flex flex-shrink justify-around gap-1">
                  <div
                    className="btn-primary btn-xs btn h-full w-10 px-6 text-4xl text-red-600"
                    onClick={decrement}
                    onMouseDown={() => holdRepeatStart(decrement)}
                    onMouseUp={holdRepeatStop}
                    onTouchStart={() => holdRepeatStart(decrement)}
                    onTouchEnd={holdRepeatStop}
                  >
                    {' '}
                    -{' '}
                  </div>
                  <div
                    className="btn-primary btn-xs btn ml-1 h-full w-10 px-6 text-4xl text-green-400"
                    onClick={increment}
                    onMouseDown={() => holdRepeatStart(increment)}
                    onMouseUp={holdRepeatStop}
                    onTouchStart={() => holdRepeatStart(increment)}
                    onTouchEnd={holdRepeatStop}
                  >
                    {' '}
                    +{' '}
                  </div>
                </div>
              </div>

              <FoodItemView
                foodItem={{
                  id,
                  food: itemData?.food ?? mockFood({ name: 'THIS IS A BUG' }), // TODO: Remove mock food
                  quantity: Number(quantity),
                }}
                className="mt-4"
                onClick={() => {
                  if (itemData?.food.recipeId !== undefined) {
                    recipeEditModalRef.current?.showModal()
                  } else {
                    alert('Alimento não editável (ainda)')
                  }
                }}
                header={
                  <FoodItemView.Header
                    name={<FoodItemView.Header.Name />}
                    favorite={
                      <FoodItemView.Header.Favorite
                        favorite={
                          (itemData && isFoodFavorite(itemData.food.id)) ||
                          false
                        }
                        setFavorite={(favorite) =>
                          itemData &&
                          setFoodAsFavorite(itemData.food.id, favorite)
                        }
                      />
                    }
                  />
                }
                nutritionalInfo={<FoodItemView.NutritionalInfo />}
              />
            </>
          }
          actions={
            <ModalActions>
              {/* if there is a button in form, it will close the modal */}
              {onDelete && (
                <button
                  className="btn-error btn mr-auto"
                  onClick={(e) => {
                    e.preventDefault()

                    // TODO: Move confirm up to parent (also with all other confirmations)
                    // TODO: Replace confirm with a modal
                    if (confirm('Tem certeza que deseja excluir este item?')) {
                      onDelete?.(id)
                    }
                  }}
                >
                  Excluir
                </button>
              )}
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
                disabled={!canAdd}
                onClick={(e) => {
                  e.preventDefault()
                  onApply(createMealItemData())
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

export default MealItemAddModal
