// 'use client'

import { ItemGroup, isSimpleSingleGroup } from '@/model/foodItemGroupModel'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Modal, { ModalActions } from '../(modals)/Modal'
import FoodItemListView from '../(foodItem)/FoodItemListView'
import FoodItemView from '../(foodItem)/FoodItemView'
import { FoodItem, createFoodItem } from '@/model/foodItemModel'
import FoodSearchModal from '../newItem/FoodSearchModal'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import RecipeIcon from '../(icons)/RecipeIcon'
import RecipeEditModal from '../(recipe)/RecipeEditModal'
import { Recipe } from '@/model/recipeModel'
import { Loadable } from '@/utils/loadable'
import PageLoading from '../PageLoading'
import { searchRecipeById, updateRecipe } from '@/controllers/recipes'
import {
  ItemGroupContextProvider,
  useItemGroupContext,
} from './ItemGroupContext'
import { useUserContext } from '@/context/users.context'
import { ModalContextProvider, useModalContext } from '../(modals)/ModalContext'
import {
  addInnerItem,
  deleteInnerItem,
  editInnerItem,
  isRecipedGroupUpToDate,
} from '@/utils/groupUtils'
import { DownloadIcon } from '../(icons)/DownloadIcon'

// TODO: Rename to FoodItemEdit
export type ItemGroupEditModalProps = {
  show?: boolean
  modalId: string
  targetMealName: string
  onSaveGroup: (item: ItemGroup) => void
  onCancel?: () => void
  onDelete?: (groupId: ItemGroup['id']) => void
  onRefetch: () => void
} & { group: ItemGroup | null }

// TODO: Remove all eslint-disable-next-line react/display-name
// eslint-disable-next-line react/display-name
const ItemGroupEditModal = (props: ItemGroupEditModalProps) => {
  return (
    <ItemGroupContextProvider itemGroup={props.group}>
      <InnerItemGroupEditModal {...props} />
    </ItemGroupContextProvider>
  )
}

// eslint-disable-next-line react/display-name
const InnerItemGroupEditModal = ({
  modalId,
  targetMealName,
  onSaveGroup,
  onCancel,
  onDelete,
  onRefetch,
}: ItemGroupEditModalProps) => {
  const { visible, setVisible } = useModalContext()

  const [recipeEditModalVisible, setRecipeEditModalVisible] = useState(false)
  const [foodItemEditModalVisible, setFoodItemEditModalVisible] =
    useState(false)
  const [foodSearchModalVisible, setFoodSearchModalVisible] = useState(false)

  const { itemGroup: group } = useItemGroupContext()
  const [recipe, setRecipe] = useState<Loadable<Recipe | null>>({
    loading: true,
  })

  useEffect(() => {
    if (!group || group.type !== 'recipe') {
      setRecipe({ loading: false, errored: false, data: null })
      return
    }
    let ignore = false
    searchRecipeById(group.recipe).then((recipe) => {
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

  const { isFoodFavorite, setFoodAsFavorite } = useUserContext()

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
        setRecipe={(recipe) =>
          setRecipe({ loading: false, errored: false, data: recipe })
        }
        visible={recipeEditModalVisible}
        setVisible={setRecipeEditModalVisible}
      />
      <ExternalFoodItemEditModal
        visible={foodItemEditModalVisible}
        setVisible={setFoodItemEditModalVisible}
        impossibleFoodItem={impossibleFoodItem}
        onSaveGroup={onSaveGroup}
        selectedFoodItem={selectedFoodItem}
        setSelectedFoodItem={setSelectedFoodItem}
        targetMealName={targetMealName}
      />
      <ExternalFoodSearchModal
        visible={foodSearchModalVisible}
        setVisible={setFoodSearchModalVisible}
        onRefetch={onRefetch}
        onSaveGroup={onSaveGroup}
      />
      <ModalContextProvider visible={visible} setVisible={setVisible}>
        <Modal
          modalId={modalId}
          // TODO: Where to put this?
          // onSubmit={() => group && onSaveGroup(group)}
          header={
            <Header recipe={recipe.data} targetMealName={targetMealName} />
          }
          body={
            <Body
              recipe={recipe.data}
              isFoodFavorite={isFoodFavorite}
              setFoodAsFavorite={setFoodAsFavorite}
              setSelectedFoodItem={setSelectedFoodItem}
              foodItemEditModalVisible={foodItemEditModalVisible}
              foodSearchModalVisible={foodSearchModalVisible}
              recipeEditModalVisible={recipeEditModalVisible}
              setFoodItemEditModalVisible={setFoodItemEditModalVisible}
              setFoodSearchModalVisible={setFoodSearchModalVisible}
              setRecipeEditModalVisible={setRecipeEditModalVisible}
            />
          }
          actions={
            <Actions
              canApply={canApply}
              onSaveGroup={onSaveGroup}
              setVisible={setVisible}
              onCancel={onCancel}
              onDelete={onDelete}
            />
          }
        />
      </ModalContextProvider>
    </>
  )
}

function Header({
  targetMealName,
  recipe,
}: {
  targetMealName: string
  recipe: Recipe | null
}) {
  const { debug } = useUserContext()
  const { itemGroup: group } = useItemGroupContext()
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
  setRecipe,
  visible,
  setVisible,
}: {
  recipe: Recipe | null
  setRecipe: (recipe: Recipe | null) => void
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
}) {
  const { itemGroup: group } = useItemGroupContext()
  return (
    <ModalContextProvider visible={visible} setVisible={setVisible}>
      <RecipeEditModal
        modalId={`VERY_UNIQUE_ID_FOR_RECIPE_${group?.id}`} // TODO: Clean all modal IDs on the project
        recipe={recipe}
        onSaveRecipe={async (recipe) => {
          const updatedRecipe = await updateRecipe(recipe.id, recipe)
          setRecipe(updatedRecipe)
        }}
      />
    </ModalContextProvider>
  )
}

function ExternalFoodItemEditModal({
  visible,
  setVisible,
  targetMealName,
  selectedFoodItem,
  impossibleFoodItem,
  setSelectedFoodItem,
}: {
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
  targetMealName: string
  selectedFoodItem: FoodItem | null
  impossibleFoodItem: FoodItem
  setSelectedFoodItem: (item: FoodItem | null) => void
  onSaveGroup: (group: ItemGroup) => void
}) {
  const { itemGroup: group, setItemGroup: setGroup } = useItemGroupContext()

  return (
    <ModalContextProvider
      visible={visible}
      setVisible={(visible) => {
        if (!visible) {
          setSelectedFoodItem(null)
          // TODO: Refactor all modals so that when they close, they call onCancel() or onClose()
        }
        setVisible(visible)
      }}
    >
      <FoodItemEditModal
        modalId={`VERY_UNIQUE_ID_${group?.id}`} // TODO: Clean all modal IDs on the project
        targetName={
          (group &&
            (isSimpleSingleGroup(group) ? targetMealName : group.name)) ||
          'Erro: Grupo sem nome'
        }
        targetNameColor={
          group && isSimpleSingleGroup(group)
            ? 'text-green-500'
            : 'text-orange-400'
        }
        foodItem={selectedFoodItem ?? impossibleFoodItem}
        onApply={async (item) => {
          if (!group) {
            console.error('group is null')
            throw new Error('group is null')
          }

          const newGroup: ItemGroup = editInnerItem(group, item)

          newGroup.quantity = newGroup.items.reduce(
            (acc, curr) => acc + curr.quantity,
            0,
          )

          console.debug('newGroup', newGroup)
          setVisible(false)
          setSelectedFoodItem(null)
          setGroup(newGroup)
        }}
        onDelete={async (itemId) => {
          if (!group) {
            console.error('group is null')
            throw new Error('group is null')
          }

          const newGroup: ItemGroup = deleteInnerItem(group, itemId)

          newGroup.quantity = newGroup.items.reduce(
            (acc, curr) => acc + curr.quantity,
            0,
          )

          console.debug('newGroup', newGroup)
          setVisible(false)
          setGroup(newGroup)
        }}
      />
    </ModalContextProvider>
  )
}

function ExternalFoodSearchModal({
  visible,
  setVisible,
  onRefetch,
  onSaveGroup,
}: {
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
  onRefetch: () => void
  onSaveGroup: (group: ItemGroup) => void
}) {
  const { itemGroup: group } = useItemGroupContext()

  return (
    <ModalContextProvider
      visible={visible}
      setVisible={(visible) => {
        if (!visible) {
          console.debug('setSelectedMeal(null)')
          onRefetch()
        }
        setVisible(visible)
      }}
    >
      <FoodSearchModal
        targetName={group?.name ?? 'ERRO: Grupo de alimentos não especificado'}
        onFinish={() => {
          console.debug('setSelectedMeal(null)')
          setVisible(false)
          onRefetch()
        }}
        onNewItemGroup={async (newGroup) => {
          // TODO: Create a proper onNewFoodItem function
          console.debug('onNewItemGroup', newGroup)

          if (!group) {
            console.error('group is null')
            throw new Error('group is null')
          }

          if (!isSimpleSingleGroup(newGroup)) {
            console.error('TODO: Handle non-simple groups')
            alert('TODO: Handle non-simple groups')
            return
          }

          const finalGroup: ItemGroup = addInnerItem(group, newGroup.items[0])

          console.debug(
            'onNewFoodItem: applying',
            JSON.stringify(finalGroup, null, 2),
          )
          onSaveGroup(finalGroup)
        }}
      />
    </ModalContextProvider>
  )
}

function Body({
  recipe,
  setSelectedFoodItem,
  isFoodFavorite,
  setFoodAsFavorite,
  setRecipeEditModalVisible,
  setFoodItemEditModalVisible,
  setFoodSearchModalVisible,
}: {
  recipe: Recipe | null
  setSelectedFoodItem: React.Dispatch<React.SetStateAction<FoodItem | null>>
  isFoodFavorite: (foodId: number) => boolean
  setFoodAsFavorite: (foodId: number, isFavorite: boolean) => void
  recipeEditModalVisible: boolean
  setRecipeEditModalVisible: Dispatch<SetStateAction<boolean>>
  foodItemEditModalVisible: boolean
  setFoodItemEditModalVisible: Dispatch<SetStateAction<boolean>>
  foodSearchModalVisible: boolean
  setFoodSearchModalVisible: Dispatch<SetStateAction<boolean>>
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
                <>
                  {recipe && isRecipedGroupUpToDate(group, recipe) ? (
                    <button
                      className="my-auto ml-auto"
                      onClick={() => {
                        // TODO: Create recipe for groups that don't have one
                        setRecipeEditModalVisible(true)
                      }}
                    >
                      <RecipeIcon />
                    </button>
                  ) : (
                    <button
                      className="my-auto ml-auto hover:animate-pulse"
                      onClick={() => {
                        if (!recipe) {
                          return
                        }

                        const newItems = [...recipe.items]

                        const newGroup: ItemGroup = { ...group }

                        newGroup.items = newItems

                        setGroup(newGroup)
                      }}
                    >
                      <DownloadIcon />
                    </button>
                  )}
                </>
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
              setFoodItemEditModalVisible(true)
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
              setFoodSearchModalVisible(true)
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
  canApply,
  setVisible,
}: {
  onDelete?: (groupId: number) => void
  onCancel?: () => void
  onSaveGroup: (group: ItemGroup) => void
  canApply: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
}) {
  const { itemGroup: group } = useItemGroupContext()
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
          setVisible(false)
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
