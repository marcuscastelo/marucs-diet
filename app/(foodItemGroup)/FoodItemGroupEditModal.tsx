// 'use client'

import { FoodItemGroup, isGroupSingleItem } from '@/model/foodItemGroupModel'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import Modal, { ModalActions, ModalRef } from '../(modals)/modal'
import FoodItemListView from '../(foodItem)/FoodItemListView'
import FoodItemView from '../(foodItem)/FoodItemView'
import { FoodItem } from '@/model/foodItemModel'
import { useFavoriteFoods } from '@/redux/features/userSlice'
import FoodSearchModal from '../newItem/FoodSearchModal'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import RecipeIcon from '../(icons)/RecipeIcon'

// TODO: Rename to FoodItemEdit
export type FoodItemGroupEditModalProps = {
  modalId: string
  //   meal: MealData | null
  targetMealName: string
  group: FoodItemGroup | null
  onSaveGroup: (item: FoodItemGroup) => void
  onCancel?: () => void
  onDelete?: (groupId: FoodItemGroup['id']) => void
  onVisibilityChange?: (isShowing: boolean) => void
  onRefetch: () => void
  debug?: boolean
}

// eslint-disable-next-line react/display-name
const FoodItemGroupEditModal = forwardRef(
  (
    {
      modalId,
      group: initialGroup,
      targetMealName,
      onSaveGroup,
      onCancel,
      onDelete,
      onVisibilityChange,
      onRefetch,
      debug = true, // TODO: useDebug()
    }: FoodItemGroupEditModalProps,
    ref: React.Ref<ModalRef>,
  ) => {
    const [showing, setShowing_] = useState(false)

    const [group, setGroup] = useState<FoodItemGroup | null>(initialGroup)

    useEffect(() => {
      setGroup(initialGroup)
    }, [initialGroup])

    const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(
      null,
    )

    const canApply = (group?.name.length ?? 0) > 0 && selectedFoodItem === null
    const selfModalRef = useRef<ModalRef>(null)
    const foodSearchModalRef = useRef<ModalRef>(null)
    const foodItemEditModalRef = useRef<ModalRef>(null)

    useEffect(() => {
      if (!group) return

      if (isGroupSingleItem(group)) {
        setSelectedFoodItem(group.items[0])
        foodItemEditModalRef.current?.showModal()
      }
    }, [group])
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
        <FoodItemEditModal
          modalId={`VERY_UNIQUE_ID_${group?.id}`} // TODO: Clean all modal IDs on the project
          ref={foodItemEditModalRef}
          targetName={
            (group &&
              (isGroupSingleItem(group) ? targetMealName : group.name)) ||
            'Erro: Grupo sem nome'
          }
          targetNameColor={
            group && isGroupSingleItem(group)
              ? 'text-green-500'
              : 'text-orange-400'
          }
          itemData={selectedFoodItem}
          onApply={async (item) => {
            const newGroup: FoodItemGroup = {
              ...group,
              id: group?.id ?? Math.round(Math.random() * 1000000),
              name: group?.name ?? item.name,
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
            foodItemEditModalRef.current?.close()
            setSelectedFoodItem(null)
            onSaveGroup(newGroup)
          }}
          onDelete={async (itemId) => {
            const newGroup: FoodItemGroup = {
              ...group,
              id: group?.id ?? Math.round(Math.random() * 1000000),
              name: group?.name ?? 'Grupo sem nome',
              quantity: 0, // Will be set later
              type: 'simple',
              items: [...(group?.items?.filter((i) => i.id !== itemId) ?? [])],
            } satisfies FoodItemGroup

            newGroup.quantity = newGroup.items.reduce(
              (acc, curr) => acc + curr.quantity,
              0,
            )

            console.debug('newGroup', newGroup)
            foodItemEditModalRef.current?.close()
            onSaveGroup(newGroup)
          }}
          onVisibilityChange={(visible) => {
            if (!visible) {
              setSelectedFoodItem(null)
              // TODO: Refactor all modals so that when they close, they call onCancel() or onClose()
            }
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
              name: group?.name ?? item.name,
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
          onSubmit={() => group && onSaveGroup(group)}
          header={
            <>
              <h3 className="text-lg font-bold text-white">
                Editando grupo em
                <span className="text-green-500">
                  {' '}
                  &quot;{targetMealName}&quot;{' '}
                </span>
              </h3>
              {debug && (
                <code>
                  <pre>{JSON.stringify(group, null, 2)}</pre>
                </code>
              )}
            </>
          }
          onVisibilityChange={handleSetShowing}
          body={
            <>
              {group && (
                <>
                  <div className="text-md mt-4">
                    <div className="flex gap-4">
                      <div className="my-auto flex-1">
                        <input
                          className="input w-full"
                          type="text"
                          onChange={(e) =>
                            setGroup((g) => g && { ...g, name: e.target.value })
                          }
                          onFocus={(e) => e.target.select()}
                          value={group.name ?? ''}
                        />
                      </div>
                      <div className="my-auto ml-auto ">
                        <RecipeIcon />
                      </div>
                    </div>
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
                      foodItemEditModalRef.current?.showModal()
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
                      group && onDelete?.(group.id)
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
                disabled={!canApply} // TODO: Rename canAdd to canApply on FoodItemEditModal
                onClick={(e) => {
                  e.preventDefault()
                  // TODO: only onSaveGroup when apply button is pressed, i.e. keeping internal state
                  group && onSaveGroup(group)
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
