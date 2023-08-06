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
import { FoodItem, createFoodItem } from '@/model/foodItemModel'
import { useDebug, useFavoriteFoods } from '@/redux/features/userSlice'
import FoodSearchModal from '../newItem/FoodSearchModal'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import RecipeIcon from '../(icons)/RecipeIcon'
import RecipeEditModal from '../(recipe)/RecipeEditModal'
import { Recipe, createRecipeFromGroup } from '@/model/recipeModel'

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
    }: FoodItemGroupEditModalProps,
    ref: React.Ref<ModalRef>,
  ) => {
    const [showing, setShowing_] = useState(false)

    const { debug } = useDebug()

    const [group, setGroup] = useState<FoodItemGroup | null>(initialGroup)
    const [recipe, setRecipe] = useState<Recipe | null>(null)

    useEffect(() => {
      setGroup(initialGroup)
    }, [initialGroup])

    const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(
      null,
    )

    const impossibleFoodItem = createFoodItem({
      name: 'Erro de implementação: nenhum item selecionado',
      reference: 0,
    })

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
    const recipeEditModalRef = useRef<ModalRef>(null)

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
        <ExternalRecipeEditModal
          group={group}
          recipe={recipe}
          recipeEditModalRef={recipeEditModalRef}
        />
        <ExternalFoodItemEditModal
          group={group}
          foodItemEditModalRef={foodItemEditModalRef}
          impossibleFoodItem={impossibleFoodItem}
          onSaveGroup={onSaveGroup}
          selectedFoodItem={selectedFoodItem}
          setSelectedFoodItem={setSelectedFoodItem}
          targetMealName={targetMealName}
        />
        <ExternalFoodSearchModal
          foodSearchModalRef={foodSearchModalRef}
          group={group}
          onRefetch={onRefetch}
          onSaveGroup={onSaveGroup}
        />
        <Modal
          modalId={modalId}
          ref={selfModalRef}
          onSubmit={() => group && onSaveGroup(group)}
          header={<Header group={group} targetMealName={targetMealName} />}
          onVisibilityChange={handleSetShowing}
          body={
            <Body
              group={group}
              setGroup={setGroup}
              setRecipe={setRecipe}
              recipeEditModalRef={recipeEditModalRef}
              foodItemEditModalRef={foodItemEditModalRef}
              foodSearchModalRef={foodSearchModalRef}
              isFoodFavorite={isFoodFavorite}
              setFoodAsFavorite={setFoodAsFavorite}
              setSelectedFoodItem={setSelectedFoodItem}
            />
          }
          actions={
            <Actions
              canApply={canApply}
              group={group}
              onSaveGroup={onSaveGroup}
              selfModalRef={selfModalRef}
              onCancel={onCancel}
              onDelete={onDelete}
            />
          }
        />
      </>
    )
  },
)

function Header({
  targetMealName,
  group,
}: {
  targetMealName: string
  group: FoodItemGroup | null
}) {
  const { debug } = useDebug()

  return (
    <>
      <h3 className="text-lg font-bold text-white">
        Editando grupo em
        <span className="text-green-500"> &quot;{targetMealName}&quot; </span>
      </h3>
      {debug && (
        <code>
          <pre>{JSON.stringify(group, null, 2)}</pre>
        </code>
      )}
    </>
  )
}

function ExternalRecipeEditModal({
  group,
  recipe,
  recipeEditModalRef,
}: {
  group: FoodItemGroup | null
  recipe: Recipe | null
  recipeEditModalRef: React.RefObject<ModalRef>
}) {
  return (
    <RecipeEditModal
      modalId={`VERY_UNIQUE_ID_FOR_RECIPE_${group?.id}`} // TODO: Clean all modal IDs on the project
      ref={recipeEditModalRef}
      recipe={recipe}
      onSaveRecipe={async () => alert('TODO: Save recipe')}
    />
  )
}

function ExternalFoodItemEditModal({
  group,
  foodItemEditModalRef,
  targetMealName,
  selectedFoodItem,
  impossibleFoodItem,
  setSelectedFoodItem,
  onSaveGroup,
}: {
  group: FoodItemGroup | null
  foodItemEditModalRef: React.RefObject<ModalRef>
  targetMealName: string
  selectedFoodItem: FoodItem | null
  impossibleFoodItem: FoodItem
  setSelectedFoodItem: (item: FoodItem | null) => void
  onSaveGroup: (group: FoodItemGroup) => void
}) {
  return (
    <FoodItemEditModal
      modalId={`VERY_UNIQUE_ID_${group?.id}`} // TODO: Clean all modal IDs on the project
      ref={foodItemEditModalRef}
      targetName={
        (group && (isGroupSingleItem(group) ? targetMealName : group.name)) ||
        'Erro: Grupo sem nome'
      }
      targetNameColor={
        group && isGroupSingleItem(group) ? 'text-green-500' : 'text-orange-400'
      }
      foodItem={selectedFoodItem ?? impossibleFoodItem}
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
  )
}

function ExternalFoodSearchModal({
  foodSearchModalRef,
  group,
  onRefetch,
  onSaveGroup,
}: {
  foodSearchModalRef: React.RefObject<ModalRef>
  group: FoodItemGroup | null
  onRefetch: () => void
  onSaveGroup: (group: FoodItemGroup) => void
}) {
  return (
    <FoodSearchModal
      ref={foodSearchModalRef}
      targetName={group?.name ?? 'ERRO: Grupo de alimentos não especificado'}
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
  )
}

function Body({
  group,
  setGroup,
  setRecipe,
  recipeEditModalRef,
  setSelectedFoodItem,
  foodItemEditModalRef,
  isFoodFavorite,
  setFoodAsFavorite,
  foodSearchModalRef,
}: {
  group: FoodItemGroup | null
  setGroup: React.Dispatch<React.SetStateAction<FoodItemGroup | null>>
  setRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>
  recipeEditModalRef: React.RefObject<ModalRef>
  setSelectedFoodItem: React.Dispatch<React.SetStateAction<FoodItem | null>>
  foodItemEditModalRef: React.RefObject<ModalRef>
  isFoodFavorite: (foodId: number) => boolean
  setFoodAsFavorite: (foodId: number, isFavorite: boolean) => void
  foodSearchModalRef: React.RefObject<ModalRef>
}) {
  return (
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
              <div
                className="my-auto ml-auto"
                onClick={() => {
                  setRecipe(createRecipeFromGroup(group))
                  recipeEditModalRef.current?.showModal()
                }}
              >
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
  )
}

function Actions({
  onDelete,
  onCancel,
  onSaveGroup,
  group,
  selfModalRef,
  canApply,
}: {
  onDelete?: (groupId: number) => void
  onCancel?: () => void
  onSaveGroup: (group: FoodItemGroup) => void
  group: FoodItemGroup | null
  selfModalRef: React.RefObject<ModalRef>
  canApply: boolean
}) {
  return (
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
  )
}

export default FoodItemGroupEditModal
