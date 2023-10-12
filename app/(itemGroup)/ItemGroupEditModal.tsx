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
import { RecipeEditModal } from '../(recipe)/RecipeEditModal'
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
  deleteInnerItem,
  editInnerItem,
  isRecipedGroupUpToDate,
} from '@/utils/groupUtils'
import { DownloadIcon } from '../(icons)/DownloadIcon'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import useClipboard from '@/hooks/clipboard'
import PasteIcon from '../(icons)/PasteIcon'
import { deserializeClipboard } from '@/utils/clipboardUtils'
import { renegerateId } from '@/utils/idUtils'
import { ItemGroupEditor } from '@/utils/data/itemGroupEditor'
import {
  Signal,
  effect,
  useSignal,
  useSignalEffect,
} from '@preact/signals-react'

export type ItemGroupEditModalProps = {
  show?: boolean
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
  targetMealName,
  onCancel,
  onDelete,
  onRefetch,
}: ItemGroupEditModalProps) => {
  const { visible } = useModalContext()
  const { group } = useItemGroupEditContext()

  const recipeEditModalVisible = useSignal(false)
  const foodItemEditModalVisible = useSignal(false)
  const templateSearchModalVisible = useSignal(false)

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
        onRefetch={onRefetch}
      />
      <ExternalFoodItemEditModal
        visible={foodItemEditModalVisible}
        impossibleFoodItem={impossibleFoodItem}
        item={selectedFoodItem}
        onClose={() => setSelectedFoodItem(null)}
        targetMealName={targetMealName}
      />
      <ExternalTemplateSearchModal
        visible={templateSearchModalVisible}
        onRefetch={onRefetch}
      />
      <ModalContextProvider visible={visible}>
        <Modal
          hasBackdrop={true}
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
            />
          }
          actions={
            <Actions
              canApply={canApply}
              visible={visible}
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
  onRefetch,
}: {
  recipe: Recipe | null
  setRecipe: (recipe: Recipe | null) => void
  visible: Signal<boolean>
  onRefetch: () => void
}) {
  if (recipe === null) {
    return
  }

  return (
    <ModalContextProvider visible={visible}>
      <RecipeEditModal
        recipe={recipe}
        onSaveRecipe={async (recipe) => {
          console.debug(
            `[ItemGroupEditModal::ExternalRecipeEditModal] onSaveRecipe:`,
            recipe,
          )
          const updatedRecipe = await updateRecipe(recipe.id, recipe)
          console.debug(
            `[ItemGroupEditModal::ExternalRecipeEditModal] updatedRecipe:`,
            updatedRecipe,
          )
          setRecipe(updatedRecipe)
        }}
        onRefetch={onRefetch}
      />
    </ModalContextProvider>
  )
}

function ExternalFoodItemEditModal({
  visible,
  targetMealName,
  item,
  impossibleFoodItem,
  onClose,
}: {
  visible: Signal<boolean>
  targetMealName: string
  item: FoodItem | null
  impossibleFoodItem: FoodItem
  onClose: () => void
}) {
  const { group, setGroup } = useItemGroupEditContext()

  const handleCloseWithNoChanges = () => {
    visible.value = false
    onClose()
  }

  const handleCloseWithChanges = (newGroup: ItemGroup) => {
    if (!group) {
      console.error('group is null')
      throw new Error('group is null')
    }

    visible.value = false
    setGroup(newGroup)
    onClose()
  }

  useSignalEffect(() => {
    if (!visible.value) {
      handleCloseWithNoChanges()
    }
  })

  return (
    <ModalContextProvider visible={visible}>
      <FoodItemEditModal
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
        foodItem={item ?? impossibleFoodItem}
        onApply={async (item) => {
          if (!group) {
            console.error('group is null')
            throw new Error('group is null')
          }

          // TODO: Allow user to edit recipe inside a group
          if (item.__type === 'RecipeItem') {
            //
            alert(
              'Ainda não é possível editar receitas! Funcionalidade em desenvolvimento',
            )
            return
          }
          const newGroup: ItemGroup = editInnerItem(group, item)

          console.debug('newGroup', newGroup)
          handleCloseWithChanges(newGroup)
        }}
        onDelete={async (itemId) => {
          if (!group) {
            console.error('group is null')
            throw new Error('group is null')
          }

          const newGroup: ItemGroup = deleteInnerItem(group, itemId)

          console.debug('newGroup', newGroup)
          handleCloseWithChanges(newGroup)
        }}
      />
    </ModalContextProvider>
  )
}

// TODO: This component is duplicated between RecipeEditModal and ItemGroupEditModal, must be refactored
function ExternalTemplateSearchModal({
  visible,
  onRefetch,
}: {
  visible: Signal<boolean>
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
      alert('TODO: Handle non-simple groups') // TODO: Change all alerts with ConfirmModal
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
    visible.value = false
    // onRefetch()
  }

  useSignalEffect(() => {
    if (!visible) {
      console.debug(`[ExternalTemplateSearchModal] onRefetch`)
      onRefetch()
    }
  })

  return (
    <ModalContextProvider visible={visible}>
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
  recipeEditModalVisible,
  foodItemEditModalVisible,
  templateSearchModalVisible,
}: {
  recipe: Recipe | null
  setSelectedFoodItem: React.Dispatch<React.SetStateAction<FoodItem | null>>
  isFoodFavorite: (foodId: number) => boolean
  setFoodAsFavorite: (foodId: number, isFavorite: boolean) => void
  recipeEditModalVisible: Signal<boolean>
  foodItemEditModalVisible: Signal<boolean>
  templateSearchModalVisible: Signal<boolean>
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
      body: 'Tem certeza que deseja colar os itens?',
      actions: [
        {
          text: 'Cancelar',
          onClick: () => undefined,
        },
        { text: 'Colar', primary: true, onClick: handlePasteAfterConfirm },
      ],
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
                        recipeEditModalVisible.value = true
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

                        const newGroup = new ItemGroupEditor(group)
                          .clearItems()
                          .addItems(recipe.items)
                          .finish()

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
              if (item.__type === 'RecipeItem') {
                //
                alert(
                  'Ainda não é possível editar receitas! Funcionalidade em desenvolvimento',
                )
                return
              }
              // if (group?.type === 'recipe') {
              //   recipeEditModalRef.current?.showModal()
              // } else {

              setSelectedFoodItem(item)
              foodItemEditModalVisible.value = true
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
              templateSearchModalVisible.value = true
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
  visible,
}: {
  onDelete?: (groupId: number) => void
  onCancel?: () => void
  canApply: boolean
  visible: Signal<boolean>
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
              alert('BUG: group or onDelete is null') // TODO: Change all alerts with ConfirmModal
            }
            showConfirmModal({
              title: 'Excluir grupo',
              body: `Tem certeza que deseja excluir o grupo ${
                group?.name ?? 'BUG: group is null' // TODO: Color group name orange and BUG red
              }?`,
              actions: [
                {
                  text: 'Cancelar',
                  onClick: () => undefined,
                },
                {
                  text: 'Excluir',
                  primary: true,
                  onClick: () => {
                    group && onDelete(group.id)
                  },
                },
              ],
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
          visible.value = false
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
