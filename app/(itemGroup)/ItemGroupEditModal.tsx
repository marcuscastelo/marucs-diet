// 'use client'

import { ItemGroup, isGroupSingleItem } from '@/model/foodItemGroupModel'
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
import FoodSearchModal from '../newItem/FoodSearchModal'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import RecipeIcon from '../(icons)/RecipeIcon'
import RecipeEditModal from '../(recipe)/RecipeEditModal'
import { Recipe, createRecipeFromGroup } from '@/model/recipeModel'
import { Loadable } from '@/utils/loadable'
import PageLoading from '../PageLoading'
import { searchRecipeById } from '@/controllers/recipes'
import {
  ItemGroupContextProvider,
  useItemGroupContext,
} from './ItemGroupContext'
import { useUserContext } from '@/context/users.context'

// TODO: Rename to FoodItemEdit
export type ItemGroupEditModalProps = {
  show?: boolean
  modalId: string
  //   meal: MealData | null
  targetMealName: string
  onSaveGroup: (item: ItemGroup) => void
  onCancel?: () => void
  onDelete?: (groupId: ItemGroup['id']) => void
  onVisibilityChange?: (isShowing: boolean) => void
  onRefetch: () => void
} & { group: ItemGroup | null }

// eslint-disable-next-line react/display-name
const ItemGroupEditModal = forwardRef(
  (props: ItemGroupEditModalProps, ref: React.Ref<ModalRef>) => {
    return (
      <ItemGroupContextProvider itemGroup={props.group}>
        <InnerItemGroupEditModal {...props} ref={ref} />
      </ItemGroupContextProvider>
    )
  },
)

// eslint-disable-next-line react/display-name
const InnerItemGroupEditModal = forwardRef(
  (
    {
      show = false,
      modalId,
      targetMealName,
      onSaveGroup,
      onCancel,
      onDelete,
      onVisibilityChange,
      onRefetch,
    }: ItemGroupEditModalProps,
    ref: React.Ref<ModalRef>,
  ) => {
    const [showing, setShowing_] = useState(false)

    const { itemGroup: group, setItemGroup: setGroup } = useItemGroupContext()
    const [recipe, setRecipe] = useState<Loadable<Recipe | null>>({
      loading: true,
    })

    useEffect(() => {
      if (!group || !group.recipe) {
        setRecipe({ loading: false, errored: false, data: null })
        return
      }
      let ignore = false
      searchRecipeById(group?.recipe).then((recipe) => {
        if (ignore) return
        setRecipe({ loading: false, errored: false, data: recipe })
      })

      return () => {
        ignore = true
      }
    }, [group, group?.recipe])

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

    const recipeEditModalRef = useRef<ModalRef>(null)

    const { isFoodFavorite, setFoodAsFavorite } = useUserContext()
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

    if (recipe.loading) {
      return (
        <PageLoading
          message={`Carregando receita atrelada ao grupo ${group?.name}`}
        />
      )
    }

    if (recipe.errored) {
      return (
        <PageLoading
          message={`Erro ao carregar receita atrelada ao grupo ${group?.name}`}
        />
      )
    }

    return (
      <>
        <ExternalRecipeEditModal
          recipe={recipe.data}
          recipeEditModalRef={recipeEditModalRef}
        />
        <ExternalFoodItemEditModal
          foodItemEditModalRef={foodItemEditModalRef}
          impossibleFoodItem={impossibleFoodItem}
          onSaveGroup={onSaveGroup}
          selectedFoodItem={selectedFoodItem}
          setSelectedFoodItem={setSelectedFoodItem}
          targetMealName={targetMealName}
        />
        <ExternalFoodSearchModal
          foodSearchModalRef={foodSearchModalRef}
          onRefetch={onRefetch}
          onSaveGroup={onSaveGroup}
        />
        <Modal
          show={show}
          modalId={modalId}
          ref={selfModalRef}
          onSubmit={() => group && onSaveGroup(group)}
          header={
            <Header recipe={recipe.data} targetMealName={targetMealName} />
          }
          onVisibilityChange={handleSetShowing}
          body={
            <Body
              setRecipe={(data) =>
                setRecipe({ loading: false, errored: false, data })
              }
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
  recipe,
}: {
  targetMealName: string
  recipe: Recipe | null
}) {
  const { debug } = useUserContext()
  const { itemGroup: group, setItemGroup: setGroup } = useItemGroupContext()
  return (
    <>
      <h3 className="text-lg font-bold text-white">
        Editando grupo em
        <span className="text-green-500"> &quot;{targetMealName}&quot; </span>
      </h3>
      Receita: {recipe?.name?.toString() ?? 'Nenhuma'}
      {debug && (
        <code>
          <pre>{JSON.stringify(group, null, 2)}</pre>
        </code>
      )}
    </>
  )
}

function ExternalRecipeEditModal({
  recipe,
  recipeEditModalRef,
}: {
  recipe: Recipe | null
  recipeEditModalRef: React.RefObject<ModalRef>
}) {
  const { itemGroup: group, setItemGroup: setGroup } = useItemGroupContext()
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
  foodItemEditModalRef,
  targetMealName,
  selectedFoodItem,
  impossibleFoodItem,
  setSelectedFoodItem,
  onSaveGroup,
}: {
  foodItemEditModalRef: React.RefObject<ModalRef>
  targetMealName: string
  selectedFoodItem: FoodItem | null
  impossibleFoodItem: FoodItem
  setSelectedFoodItem: (item: FoodItem | null) => void
  onSaveGroup: (group: ItemGroup) => void
}) {
  const { itemGroup: group, setItemGroup: setGroup } = useItemGroupContext()

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
        const newGroup: ItemGroup = {
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
        } satisfies ItemGroup

        newGroup.quantity = newGroup.items.reduce(
          (acc, curr) => acc + curr.quantity,
          0,
        )

        console.debug('newGroup', newGroup)
        foodItemEditModalRef.current?.close()
        setSelectedFoodItem(null)
        setGroup(newGroup)
      }}
      onDelete={async (itemId) => {
        const newGroup: ItemGroup = {
          ...group,
          id: group?.id ?? Math.round(Math.random() * 1000000),
          name: group?.name ?? 'Grupo sem nome',
          quantity: 0, // Will be set later
          type: 'simple',
          items: [...(group?.items?.filter((i) => i.id !== itemId) ?? [])],
        } satisfies ItemGroup

        newGroup.quantity = newGroup.items.reduce(
          (acc, curr) => acc + curr.quantity,
          0,
        )

        console.debug('newGroup', newGroup)
        foodItemEditModalRef.current?.close()
        setGroup(newGroup)
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
  onRefetch,
  onSaveGroup,
}: {
  foodSearchModalRef: React.RefObject<ModalRef>
  onRefetch: () => void
  onSaveGroup: (group: ItemGroup) => void
}) {
  const { itemGroup: group, setItemGroup: setGroup } = useItemGroupContext()
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

        const newGroup: ItemGroup = {
          ...group,
          id: group?.id ?? Math.round(Math.random() * 1000000),
          name: group?.name ?? item.name,
          quantity: (group?.quantity ?? 0) + item.quantity,
          type: 'simple', // TODO: Allow user to change type
          items: [
            ...(group?.items?.filter((i) => i.id !== item.id) || []),
            { ...item },
          ],
        } satisfies ItemGroup

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
  setRecipe,
  recipeEditModalRef,
  setSelectedFoodItem,
  foodItemEditModalRef,
  isFoodFavorite,
  setFoodAsFavorite,
  foodSearchModalRef,
}: {
  setRecipe: (recipe: Recipe | null) => void
  recipeEditModalRef: React.RefObject<ModalRef>
  setSelectedFoodItem: React.Dispatch<React.SetStateAction<FoodItem | null>>
  foodItemEditModalRef: React.RefObject<ModalRef>
  isFoodFavorite: (foodId: number) => boolean
  setFoodAsFavorite: (foodId: number, isFavorite: boolean) => void
  foodSearchModalRef: React.RefObject<ModalRef>
}) {
  const { itemGroup: group, setItemGroup: setGroup } = useItemGroupContext()
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
              {group.type === 'recipe' && (
                <div
                  className="my-auto ml-auto"
                  onClick={() => {
                    setRecipe(createRecipeFromGroup(group))
                    recipeEditModalRef.current?.showModal()
                  }}
                >
                  <RecipeIcon />
                </div>
              )}
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
                    onSetFavorite={(favorite) =>
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
  selfModalRef,
  canApply,
}: {
  onDelete?: (groupId: number) => void
  onCancel?: () => void
  onSaveGroup: (group: ItemGroup) => void
  selfModalRef: React.RefObject<ModalRef>
  canApply: boolean
}) {
  const { itemGroup: group, setItemGroup: setGroup } = useItemGroupContext()
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

export default ItemGroupEditModal
