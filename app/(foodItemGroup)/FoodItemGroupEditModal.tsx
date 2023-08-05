// 'use client'

import { FoodItemGroup } from '@/model/foodItemGroupModel'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import Modal, { ModalActions, ModalRef } from '../(modals)/modal'
import FoodItemListView from '../(foodItem)/FoodItemListView'
import FoodItemView from '../(foodItem)/FoodItemView'
import { FoodItem } from '@/model/foodItemModel'
import { useFavoriteFoods } from '@/redux/features/userSlice'
import FoodSearchModal from '../newItem/FoodSearchModal'
import MealItemAddModal from '../(foodItem)/MealItemAddModal'

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
  onSaveGroup: (item: FoodItemGroup) => void
  onCancel?: () => void
  onDelete?: (groupId: FoodItemGroup['id']) => void
  onVisibilityChange?: (isShowing: boolean) => void
  onRefetch: () => void
}

// eslint-disable-next-line react/display-name
const FoodItemGroupEditModal = forwardRef(
  (
    {
      modalId,
      group,
      targetMealName,
      onSaveGroup,
      onCancel,
      onDelete,
      onVisibilityChange,
      onRefetch,
    }: FoodItemGroupEditModalProps,
    ref: React.Ref<ModalRef>,
  ) => {
    const [showing, setShowing_] = useState(false)
    const [quantity, setQuantity] = useState(group?.quantity?.toString() ?? '')
    const [id, setId] = useState(group?.id ?? Math.random()) // TODO: Proper ID generation on other module or backend

    const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(
      null,
    )

    const canApply = quantity !== '' && Number(quantity) > 0
    // const quantityRef = useRef<HTMLInputElement>(null)
    const selfModalRef = useRef<ModalRef>(null)
    const foodSearchModalRef = useRef<ModalRef>(null)
    const mealItemAddModalRef = useRef<ModalRef>(null)
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
        <MealItemAddModal
          modalId={`VERY_UNIQUE_ID_${id}`} // TODO: Clean all modal IDs on the project
          ref={mealItemAddModalRef}
          targetName={
            group?.name ?? 'ERRO: Grupo de alimentos não especificado'
          }
          itemData={selectedFoodItem}
          onApply={async (item) => {
            const newGroup: FoodItemGroup = {
              ...group,
              id: group?.id ?? Math.round(Math.random() * 1000000),
              name: `${group?.name ?? ''}`,
              quantity: 0, // Will be set later
              type: 'simple',
              items: [
                ...(group?.items?.map((i) => {
                  if (i.id !== item.id) {
                    return i
                  }
                  return {
                    ...item,
                  }
                }) ?? []),
              ],
            } satisfies FoodItemGroup

            newGroup.quantity = newGroup.items.reduce(
              (acc, curr) => acc + curr.quantity,
              0,
            )

            console.debug('newGroup', newGroup)
            mealItemAddModalRef.current?.close()
            onSaveGroup(newGroup)
          }}
        />
        <FoodSearchModal
          ref={foodSearchModalRef}
          targetName={
            group?.name ?? 'ERRO: Grupo de alimentos não especificado'
          }
          onFinish={() => {
            console.debug('setSelectedMeal(null)')
            foodSearchModalRef.current?.close()
            onRefetch()
          }}
          onVisibilityChange={(visible) => {
            if (!visible) {
              console.debug('setSelectedMeal(null)')
              onRefetch()
            }
          }}
          onNewFoodItem={async (item) => {
            // TODO: Create a proper onNewFoodItem function
            console.debug('onNewFoodItem', item)

            const newGroup: FoodItemGroup = {
              ...group,
              id: group?.id ?? Math.round(Math.random() * 1000000),
              name: `${group?.name ?? ''} | ${item.name}`,
              quantity: (group?.quantity ?? 0) + item.quantity,
              type: 'simple', // TODO: Allow user to change type
              items: [
                ...(group?.items?.filter((i) => i.id !== item.id) || []),
                { ...item },
              ],
            } satisfies FoodItemGroup

            console.debug(
              'onNewFoodItem: applying',
              JSON.stringify(newGroup, null, 2),
            )
            onSaveGroup(newGroup)
          }}
        />
        <Modal
          modalId={modalId}
          ref={selfModalRef}
          onSubmit={() => onSaveGroup(createMealItemGroup())}
          header={
            <h3 className="text-lg font-bold text-white">
              Editando grupo em
              <span className="text-green-500">
                {' '}
                &quot;{targetMealName}&quot;{' '}
              </span>
            </h3>
          }
          onVisibilityChange={handleSetShowing}
          body={
            <>
              {group && (
                <>
                  <div className="text-md">
                    <div className="my-auto mr-2">Nome do grupo</div>
                    <input
                      className="input w-full"
                      disabled
                      value={group?.name ?? 'ERRO: Nome não especificado'}
                    />
                  </div>

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
                      setSelectedFoodItem(item)
                      mealItemAddModalRef.current?.showModal()
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

                  <button
                    className="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    onClick={() => {
                      foodSearchModalRef.current?.showModal()
                    }}
                  >
                    Adicionar item
                  </button>
                </>
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
                  onSaveGroup(createMealItemGroup())
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
