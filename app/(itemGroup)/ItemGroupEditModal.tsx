'use client'

import {
  ItemGroup,
  isSimpleSingleGroup,
  itemGroupSchema,
} from '@/model/itemGroupModel'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react'
import Modal, { ModalActions } from '../(modals)/Modal'
import FoodItemListView from '../(foodItem)/FoodItemListView'
import FoodItemView from '../(foodItem)/FoodItemView'
import { FoodItem, createFoodItem, foodItemSchema } from '@/model/foodItemModel'
import { TemplateSearchModal } from '../templateSearch/TemplateSearchModal'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import RecipeIcon from '../(icons)/RecipeIcon'
import RecipeEditModal from '../(recipe)/RecipeEditModal'
import { Recipe } from '@/model/recipeModel'
import { Loadable } from '@/utils/loadable'
import PageLoading from '../PageLoading'
import { searchRecipeById, updateRecipe } from '@/controllers/recipes'
import {
  ItemGroupEditContextProvider,
  useItemGroupEditContext,
} from './ItemGroupEditContext'
import { useUserContext } from '@/context/users.context'
import { ModalContextProvider, useModalContext } from '../(modals)/ModalContext'
import {
  addInnerItem,
  addInnerItems,
  convertToGroups,
  deleteInnerItem,
  editInnerItem,
  isRecipedGroupUpToDate,
} from '@/utils/groupUtils'
import { DownloadIcon } from '../(icons)/DownloadIcon'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import useClipboard from '@/hooks/clipboard'
import PasteIcon from '../(icons)/PasteIcon'
import { deserialize as deserializeClipboard } from '@/utils/clipboardUtils'
import { renegerateId } from '@/utils/idUtils'

export type ItemGroupEditModalProps = {
  show?: boolean
  modalId: string
  targetMealName: string
  onSaveGroup: (item: ItemGroup) => void
  onCancel?: () => void
  onDelete?: (groupId: ItemGroup['id']) => void
  onRefetch: () => void
} & { group: ItemGroup | null }

const ItemGroupEditModal = (props: ItemGroupEditModalProps) => {
  return (
    <ItemGroupEditContextProvider
      group={props.group}
      onSaveGroup={props.onSaveGroup}
    >
      <InnerItemGroupEditModal {...props} />
    </ItemGroupEditContextProvider>
  )
}

const InnerItemGroupEditModal = ({
  modalId,
  targetMealName,
  onCancel,
  onDelete,
  onRefetch,
}: ItemGroupEditModalProps) => {
  const { visible, setVisible } = useModalContext()
  const { group } = useItemGroupEditContext()

  const [recipeEditModalVisible, setRecipeEditModalVisible] = useState(false)
  const [foodItemEditModalVisible, setFoodItemEditModalVisible] =
    useState(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    useState(false)

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
        selectedFoodItem={selectedFoodItem}
        setSelectedFoodItem={setSelectedFoodItem}
        targetMealName={targetMealName}
      />
      <ExternalTemplateSearchModal
        visible={templateSearchModalVisible}
        setVisible={setTemplateSearchModalVisible}
        onRefetch={onRefetch}
      />
      <ModalContextProvider visible={visible} setVisible={setVisible}>
        <Modal
          modalId={modalId}
          hasBackdrop={false}
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
              templateSearchModalVisible={templateSearchModalVisible}
              recipeEditModalVisible={recipeEditModalVisible}
              setFoodItemEditModalVisible={setFoodItemEditModalVisible}
              setTemplateSearchModalVisible={setTemplateSearchModalVisible}
              setRecipeEditModalVisible={setRecipeEditModalVisible}
            />
          }
          actions={
            <Actions
              canApply={canApply}
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
  const { group } = useItemGroupEditContext()
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
  const { group } = useItemGroupEditContext()
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
}) {
  const { group, setGroup } = useItemGroupEditContext()

  return (
    <ModalContextProvider
      visible={visible}
      setVisible={(visible) => {
        // TODO: Implement onClose and onOpen to reduce code duplication
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

function ExternalTemplateSearchModal({
  visible,
  setVisible,
  onRefetch,
}: {
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
  onRefetch: () => void
}) {
  const { group, setGroup } = useItemGroupEditContext()

  const handleNewItemGroup = async (newGroup: ItemGroup) => {
    console.debug('onNewItemGroup', newGroup)

    if (!group) {
      console.error('group is null')
      throw new Error('group is null')
    }

    if (!isSimpleSingleGroup(newGroup)) {
      // TODO: Handle non-simple groups on onNewFoodItem
      console.error('TODO: Handle non-simple groups')
      alert('TODO: Handle non-simple groups')
      return
    }

    const finalGroup: ItemGroup = addInnerItem(group, newGroup.items[0])

    console.debug(
      'onNewFoodItem: applying',
      JSON.stringify(finalGroup, null, 2),
    )

    setGroup(finalGroup)
  }

  const handleFinishSearch = () => {
    setVisible(false)
    onRefetch()
  }

  return (
    <ModalContextProvider
      visible={visible}
      setVisible={(visible) => {
        // TODO: Implement onClose and onOpen to reduce code duplication
        if (!visible) {
          console.debug('setSelectedMeal(null)')
          onRefetch()
        }
        setVisible(visible)
      }}
    >
      <TemplateSearchModal
        targetName={group?.name ?? 'ERRO: Grupo de alimentos não especificado'}
        onFinish={handleFinishSearch}
        onNewItemGroup={handleNewItemGroup}
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
  setTemplateSearchModalVisible,
}: {
  recipe: Recipe | null
  setSelectedFoodItem: React.Dispatch<React.SetStateAction<FoodItem | null>>
  isFoodFavorite: (foodId: number) => boolean
  setFoodAsFavorite: (foodId: number, isFavorite: boolean) => void
  recipeEditModalVisible: boolean
  setRecipeEditModalVisible: Dispatch<SetStateAction<boolean>>
  foodItemEditModalVisible: boolean
  setFoodItemEditModalVisible: Dispatch<SetStateAction<boolean>>
  templateSearchModalVisible: boolean
  setTemplateSearchModalVisible: Dispatch<SetStateAction<boolean>>
}) {
  const acceptedClipboardSchema = foodItemSchema.or(itemGroupSchema)

  const { group, setGroup } = useItemGroupEditContext()
  const {
    write: writeToClipboard,
    clear: clearClipboard,
    clipboard: clipboardText,
  } = useClipboard({
    filter: (clipboard) => {
      if (!clipboard) return false
      let parsedClipboard: unknown
      try {
        parsedClipboard = JSON.parse(clipboard)
      } catch (e) {
        // Error parsing JSON. Probably clipboard is some random text from the user
        return false
      }

      return acceptedClipboardSchema.safeParse(parsedClipboard).success
    },
  })
  const { show: showConfirmModal } = useConfirmModalContext()

  const hasValidPastableOnClipboard = clipboardText.length > 0

  const handlePasteAfterConfirm = useCallback(() => {
    const data = deserializeClipboard(clipboardText, acceptedClipboardSchema)

    if (!data) {
      throw new Error('Invalid clipboard data: ' + clipboardText)
    }

    if (!group) {
      throw new Error('BUG: group is null')
    }

    if ('items' in data) {
      // data is an itemGroup
      const newGroup = addInnerItems(group, data.items.map(renegerateId))
      setGroup(newGroup)
    } else {
      const newGroup = addInnerItem(group, renegerateId(data))
      setGroup(newGroup)
    }

    // Clear clipboard
    clearClipboard()
  }, [acceptedClipboardSchema, clipboardText, group, setGroup, clearClipboard])

  const handlePaste = useCallback(() => {
    showConfirmModal({
      title: 'Colar itens',
      message: 'Tem certeza que deseja colar os itens?',
      onConfirm: handlePasteAfterConfirm,
    })
  }, [handlePasteAfterConfirm, showConfirmModal])

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
              {hasValidPastableOnClipboard && (
                <div
                  className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
                  onClick={handlePaste}
                >
                  <PasteIcon />
                </div>
              )}
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
            foodItems={group.items ?? []}
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
                    favorite={isFoodFavorite(item.reference)}
                    onSetFavorite={(favorite) =>
                      setFoodAsFavorite(item.reference, favorite)
                    }
                  />
                }
                copyButton={
                  <FoodItemView.Header.CopyButton
                    onCopyItem={(item) =>
                      writeToClipboard(JSON.stringify(item))
                    }
                  />
                }
              />
            )}
          />

          <button
            className="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            onClick={() => {
              setTemplateSearchModalVisible(true)
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
  canApply,
  setVisible,
}: {
  onDelete?: (groupId: number) => void
  onCancel?: () => void
  canApply: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
}) {
  // TODO: Make itemGroup not nullable? Reflect changes on all group?. and itemGroup?. and ?? everywhere
  const { group, saveGroup } = useItemGroupEditContext()

  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <ModalActions>
      {/* if there is a button in form, it will close the modal */}
      {onDelete && (
        <button
          className="btn-error btn mr-auto"
          onClick={(e) => {
            e.preventDefault()
            if (!group || !onDelete) {
              alert('BUG: group or onDelete is null')
            }
            showConfirmModal({
              title: 'Excluir grupo',
              message: `Tem certeza que deseja excluir o grupo ${
                group?.name ?? 'BUG: group is null' // TODO: Color group name orange and BUG red
              }?`,
              onConfirm: () => {
                group && onDelete(group.id)
              },
            })
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
          saveGroup()
        }}
      >
        Aplicar
      </button>
    </ModalActions>
  )
}

export default ItemGroupEditModal
