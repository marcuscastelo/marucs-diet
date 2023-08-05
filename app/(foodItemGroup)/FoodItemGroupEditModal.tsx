// 'use client'

import { FoodItemGroup } from '@/model/foodItemGroupModel'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import Modal, { ModalActions, ModalRef } from '../(modals)/modal'
import FoodItemListView from '../(foodItem)/FoodItemListView'
import FoodItemView from '../(foodItem)/FoodItemView'
import { FoodItem } from '@/model/foodItemModel'
import { useFavoriteFoods } from '@/redux/features/userSlice'

// import {
//   forwardRef,
//   useEffect,
//   useImperativeHandle,
//   useRef,
//   useState,
// } from 'react'
// import FoodItemView from './(foodItem)/FoodItemView'
// import { FoodItem } from '@/model/foodItemModel'
// import { MealData } from '@/model/mealModel'
// import { useFavoriteFoods } from '@/redux/features/userSlice'
// import Modal, { ModalActions, ModalRef } from './(modals)/modal'
// import { mockFood } from './test/unit/(mock)/mockData'
// import RecipeEditModal from './(recipe)/RecipeEditModal'
// import { Recipe } from '@/model/recipeModel'
// import { Loadable } from '@/utils/loadable'
// import { searchRecipeById } from '@/controllers/recipes'

// const RECIPE_EDIT_MODAL_ID = 'meal-item-add-modal:self:recipe-edit-modal'

// // TODO: Rename to FoodItemEdit
export type FoodItemGroupEditModalProps = {
  modalId: string
  //   meal: MealData | null
  targetMealName: string
  group: (Partial<FoodItemGroup> & Pick<FoodItemGroup, never>) | null
  onApply: (item: FoodItemGroup) => void
  onCancel?: () => void
  onDelete?: (groupId: FoodItemGroup['id']) => void
  onVisibilityChange?: (isShowing: boolean) => void
}

// eslint-disable-next-line react/display-name
const FoodItemGroupEditModal = forwardRef(
  (
    {
      modalId,
      group,
      targetMealName,
      onApply,
      onCancel,
      onDelete,
      onVisibilityChange,
    }: FoodItemGroupEditModalProps,
    ref: React.Ref<ModalRef>,
  ) => {
    const [showing, setShowing_] = useState(false)
    const [quantity, setQuantity] = useState(group?.quantity?.toString() ?? '')
    const [id, setId] = useState(group?.id ?? Math.random()) // TODO: Proper ID generation on other module or backend
    const canApply = quantity !== '' && Number(quantity) > 0
    const quantityRef = useRef<HTMLInputElement>(null)
    const selfModalRef = useRef<ModalRef>(null)
    //     const recipeEditModalRef = useRef<ModalRef>(null)
    //     const [quantityFieldDisabled, setQuantityFieldDisabled] = useState(true)
    //     const [recipe, setRecipe] = useState<Loadable<Recipe | null>>({
    //       loading: true,
    //     })
    const { isFoodFavorite, setFoodAsFavorite } = useFavoriteFoods()
    const handleSetShowing = (isShowing: boolean) => {
      setShowing_(isShowing)
      onVisibilityChange?.(isShowing)
    }
    //     useEffect(() => {
    //       if (!showing) {
    //         setQuantity('')
    //         setId(Math.round(Math.random() * 1000000))
    //         setQuantityFieldDisabled(true)
    //         return
    //       }
    //       const timeout = setTimeout(() => {
    //         setQuantityFieldDisabled(false)
    //       }, 100)
    //       return () => {
    //         clearTimeout(timeout)
    //       }
    //     }, [showing])
    //     useEffect(() => {
    //       if (itemData?.quantity !== undefined) {
    //         setQuantity(itemData?.quantity.toString())
    //       }
    //       if (itemData?.id !== undefined) {
    //         setId(itemData?.id)
    //       }
    //     }, [itemData?.quantity, itemData?.id])
    //     useEffect(() => {
    //       if (itemData?.type !== 'recipe') {
    //         setRecipe({ loading: false, data: null })
    //       }
    //       if (itemData?.reference === undefined) {
    //         setRecipe({ loading: false, data: null })
    //       } else {
    //         setRecipe({ loading: true })
    //         searchRecipeById(itemData?.reference).then((recipe) => {
    //           setRecipe({ loading: false, data: recipe })
    //         })
    //       }
    //     }, [itemData?.type, itemData?.reference])
    //     useEffect(() => {
    //       setQuantityFieldDisabled(true)
    //       const timeout = setTimeout(() => {
    //         setQuantityFieldDisabled(false)
    //       }, 1000)
    //       return () => {
    //         clearTimeout(timeout)
    //       }
    //     }, [itemData?.quantity, itemData?.id])
    //     const increment = () =>
    //       setQuantity((old) => (Number(old ?? '0') + 1).toString())
    //     const decrement = () =>
    //       setQuantity((old) => Math.max(0, Number(old ?? '0') - 1).toString())
    //     const [currentHoldTimeout, setCurrentHoldTimeout] =
    //       useState<NodeJS.Timeout>()
    //     const [currentHoldInterval, setCurrentHoldInterval] =
    //       useState<NodeJS.Timeout>()
    //     const holdRepeatStart = (action: () => void) => {
    //       setCurrentHoldTimeout(
    //         setTimeout(() => {
    //           setCurrentHoldInterval(
    //             setInterval(() => {
    //               action()
    //             }, 100),
    //           )
    //         }, 500),
    //       )
    //     }
    //     const holdRepeatStop = () => {
    //       if (currentHoldTimeout) {
    //         clearTimeout(currentHoldTimeout)
    //       }
    //       if (currentHoldInterval) {
    //         clearInterval(currentHoldInterval)
    //       }
    //     }
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
    const createMealItemGroup = (): FoodItemGroup =>
      ({
        id,
        name: 'FoodItemGroup - REPLACE ME', // TODO: Replace FoodItemGroup name
        type: 'simple', // TODO: Allow user to change type
        quantity: Number(quantity), // TODO: What does quantity mean for a FoodItemGroup?
        items: group?.items ?? [],

        // TODO: Remove old code below when no longer needed
        // quantity: Number(quantity),
        // reference: itemData?.reference ?? 0,
        // macros: itemData?.macros ?? {
        //   protein: 0,
        //   carbs: 0,
        //   fat: 0,
        // },
        // type: itemData?.type ?? 'food',
      }) satisfies FoodItemGroup

    return (
      <>
        {/* {itemData?.food.name.toString()}
              {itemData?.food.id.toString()}
              {itemData?.food.recipeId?.toString() ?? 'NO RECIPE ID'} */}
        {/* {recipe.loading.valueOf().toString()}
        {(!recipe.loading && JSON.stringify(recipe.data, null, 2)) ||
          'NO RECIPE DATA'} */}

        {/* //TODO: Allow user to edit recipe */}
        {/* <RecipeEditModal
          modalId={RECIPE_EDIT_MODAL_ID}
          ref={recipeEditModalRef}
          recipe={(!recipe.loading && recipe.data) || null}
          onSaveRecipe={async () => alert('TODO: Save recipe')}
        /> */}
        <Modal
          modalId={modalId}
          ref={selfModalRef}
          onSubmit={() => onApply(createMealItemGroup())}
          header={
            <h3 className="text-lg font-bold text-white">
              Editando item em
              <span className="text-green-500">
                {' '}
                &quot;{targetMealName}&quot;{' '}
              </span>
            </h3>
          }
          onVisibilityChange={handleSetShowing}
          body={
            <>
              {/* <p className="mt-1 text-gray-400">Atalhos</p>
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
                    disabled={true}
                    // TODO: Only allow for recipe items?
                    // disabled={quantityFieldDisabled}
                    value={quantity}
                    ref={quantityRef}
                    onChange={(e) =>
                      setQuantity(e.target.value.replace(/[^0-9]/, ''))
                    }
                    type="number"
                    placeholder="Quantidade (gramas)"
                    className={`input-bordered  input mt-1  border-gray-300 bg-gray-800 ${
                      !canApply ? 'input-error border-red-500' : ''
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
              </div> */}
              {group && (
                <FoodItemListView
                  foodItems={
                    group.items ?? []

                    // {
                    //   id,
                    //   quantity: Number(quantity),
                    //   type: group.type ?? 'food',
                    //   reference: group.reference,
                    //   macros: group.macros,
                    // } satisfies FoodItem
                  }
                  // TODO: Check if this margin was lost
                  //   className="mt-4"
                  onItemClick={(item) => {
                    // TODO: Allow user to edit recipe
                    // if (group?.type === 'recipe') {
                    //   recipeEditModalRef.current?.showModal()
                    // } else {
                    alert('Alimento não editável (ainda)')
                    // }
                  }}
                  makeHeaderFn={(item) => (
                    <FoodItemView.Header
                      name={<FoodItemView.Header.Name />}
                      favorite={
                        <FoodItemView.Header.Favorite
                          favorite={
                            // TODO: isRecipeFavorite as well
                            isFoodFavorite(item.reference)
                          }
                          setFavorite={(favorite) =>
                            // TODO: setRecipeAsFavorite as well
                            setFoodAsFavorite(item.reference, favorite)
                          }
                        />
                      }
                    />
                  )}
                />
              )}
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
                disabled={!canApply} // TODO: Rename canAdd to canApply on MealItemAddModal
                onClick={(e) => {
                  e.preventDefault()
                  onApply(createMealItemGroup())
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

export default FoodItemGroupEditModal
