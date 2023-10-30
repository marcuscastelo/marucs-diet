'use client'

import {
  ItemGroup,
  RecipedItemGroup,
  isSimpleSingleGroup,
  itemGroupSchema,
  recipedItemGroup,
} from '@/modules/diet/item-group/domain/itemGroup'
import { useCallback } from 'react'
import Modal, { ModalActions } from '@/sections/common/components/Modal'
import FoodItemListView from '@/sections/food-item/components/FoodItemListView'
import FoodItemView from '@/sections/food-item/components/FoodItemView'
import {
  FoodItem,
  createFoodItem,
  foodItemSchema,
} from '@/modules/diet/food-item/domain/foodItem'
import { TemplateSearchModal } from '@/sections/search/components/TemplateSearchModal'
import FoodItemEditModal from '@/sections/food-item/components/FoodItemEditModal'
import RecipeIcon from '@/sections/common/components/icons/RecipeIcon'
import { RecipeEditModal } from '@/sections/recipe/components/RecipeEditModal'
import { Recipe, createRecipe } from '@/modules/diet/recipe/domain/recipe'
import { Loadable } from '@/legacy/utils/loadable'
import PageLoading from '@/sections/common/components/PageLoading'

import {
  ItemGroupEditContextProvider,
  useItemGroupEditContext,
} from '@/sections/item-group/context/ItemGroupEditContext'
import {
  ModalContextProvider,
  useModalContext,
} from '@/sections/common/context/ModalContext'
import { isRecipedGroupUpToDate } from '@/legacy/utils/groupUtils'
import { DownloadIcon } from '@/sections/common/components/icons/DownloadIcon'
import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import useClipboard from '@/sections/common/hooks/useClipboard'
import PasteIcon from '@/sections/common/components/icons/PasteIcon'
import { deserializeClipboard } from '@/legacy/utils/clipboardUtils'
import { regenerateId } from '@/legacy/utils/idUtils'
import { ItemGroupEditor } from '@/legacy/utils/data/itemGroupEditor'
import {
  ReadonlySignal,
  Signal,
  computed,
  signal,
  useSignal,
  useSignalEffect,
  batch,
} from '@preact/signals-react'
import { ConvertToRecipeIcon } from '@/sections/common/components/icons/ConvertToRecipeIcon'
import { deepCopy } from '@/legacy/utils/deepCopy'
import { useFloatField } from '@/sections/common/hooks/useField'
import { FloatInput } from '@/sections/common/components/FloatInput'
import { createSupabaseRecipeRepository } from '@/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import {
  currentUserId,
  isFoodFavorite,
  setFoodAsFavorite,
} from '@/modules/user/application/user'

// TODO: Use repository pattern through use cases instead of directly using repositories
const recipeRepository = createSupabaseRecipeRepository()

type EditSelection = {
  foodItem: FoodItem
} | null

const editSelection = signal<EditSelection>(null)

export type ItemGroupEditModalProps = {
  show?: boolean
  targetMealName: string
  onSaveGroup: (item: ItemGroup) => void
  onCancel?: () => void
  onDelete?: (groupId: ItemGroup['id']) => void
  onRefetch: () => void
} & { group: ReadonlySignal<ItemGroup | null> }

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
  const { show: showConfirmModal } = useConfirmModalContext()
  const recipeEditModalVisible = useSignal(false)
  const foodItemEditModalVisible = useSignal(false)
  const templateSearchModalVisible = useSignal(false)

  const recipeSignal = useSignal<Loadable<Recipe | null>>({
    loading: true,
  })

  useSignalEffect(() => {
    if (!group.value || group.value.type !== 'recipe') {
      recipeSignal.value = { loading: false, errored: false, data: null }
      return
    }

    const handleRecipeNotFound = () => {
      showConfirmModal({
        title: 'Receita não encontrada',
        body: 'A receita atrelada a esse grupo não foi encontrada. Deseja desvincular o grupo da receita?',
        actions: [
          {
            text: 'Cancelar',
            onClick: () => undefined,
          },
          {
            text: 'Desvincular',
            primary: true,
            onClick: () => {
              if (!group.value) {
                console.warn('group is null, cannot unlink recipe')
                return
              }

              group.value = new ItemGroupEditor(group.value)
                .setRecipe(undefined)
                .finish()
            },
          },
        ],
      })
    }

    recipeRepository
      .fetchRecipeById(group.value.recipe)
      .then((recipe) => {
        recipeSignal.value = { loading: false, errored: false, data: recipe }
        if (recipe === null) {
          setTimeout(() => {
            handleRecipeNotFound()
          }, 1000)
        }
      })
      .catch((e) => {
        recipeSignal.value = { loading: false, errored: true, error: e }
      })
  })

  const canApply =
    (group.value?.name.length ?? 0) > 0 && editSelection.value === null

  if (recipeSignal.value.loading) {
    return (
      <PageLoading
        message={`Carregando receita atrelada ao grupo ${group.value?.name}`}
      />
    )
  }

  if (recipeSignal.value.errored) {
    return (
      <PageLoading
        message={`Erro ao carregar receita atrelada ao grupo ${group.value
          ?.name}: ${JSON.stringify(recipeSignal.value.error)}`}
      />
    )
  }

  return (
    <>
      <ExternalRecipeEditModal
        recipe={recipeSignal.value.data}
        setRecipe={(recipe) =>
          (recipeSignal.value = {
            loading: false,
            errored: false,
            data: recipe,
          })
        }
        visible={recipeEditModalVisible}
        onRefetch={onRefetch}
      />
      <ExternalFoodItemEditModal
        visible={foodItemEditModalVisible}
        onClose={() => (editSelection.value = null)}
        targetMealName={targetMealName}
      />
      <ExternalTemplateSearchModal
        visible={templateSearchModalVisible}
        onRefetch={onRefetch}
      />
      <ModalContextProvider visible={visible}>
        <Modal
          className="border-2 border-orange-800"
          hasBackdrop={true}
          header={
            <Header
              recipe={recipeSignal.value.data}
              targetMealName={targetMealName}
            />
          }
          body={
            <Body
              recipe={computed(() =>
                recipeSignal.value.loading === false &&
                recipeSignal.value.errored === false
                  ? recipeSignal.value.data
                  : null,
              )}
              isFoodFavorite={isFoodFavorite}
              setFoodAsFavorite={setFoodAsFavorite}
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

// TODO: Unify Header, Content and Actions for each component in the entire app
/**
 * @deprecated
 */
function Header({
  targetMealName,
  recipe,
}: {
  targetMealName: string
  recipe: Recipe | null
}) {
  return (
    <>
      <h3 className="text-lg font-bold text-white">
        Editando grupo em
        <span className="text-green-500"> &quot;{targetMealName}&quot; </span>
      </h3>
      Receita: {recipe?.name?.toString() ?? 'Nenhuma'}
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
          const updatedRecipe = await recipeRepository.updateRecipe(
            recipe.id,
            recipe,
          )
          console.debug(
            `[ItemGroupEditModal::ExternalRecipeEditModal] updatedRecipe:`,
            updatedRecipe,
          )
          setRecipe(updatedRecipe)
        }}
        onRefetch={onRefetch}
        onDelete={async (recipeId) => {
          console.debug(
            `[ItemGroupEditModal::ExternalRecipeEditModal] onDelete:`,
            recipeId,
          )

          await recipeRepository.deleteRecipe(recipeId)

          setRecipe(null)
        }}
      />
    </ModalContextProvider>
  )
}

function ExternalFoodItemEditModal({
  visible,
  targetMealName,
  onClose,
}: {
  visible: Signal<boolean>
  targetMealName: string
  onClose: () => void
}) {
  const { group } = useItemGroupEditContext()

  const handleCloseWithNoChanges = () => {
    visible.value = false
    onClose()
  }

  const handleCloseWithChanges = (newGroup: ItemGroup) => {
    if (!group.value) {
      console.error('group is null')
      throw new Error('group is null')
    }

    console.debug(
      '[ExternalFoodItemEditModal] handleCloseWithChanges - newGroup: ',
      newGroup,
    )
    group.value = newGroup
    visible.value = false
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
          (group.value &&
            (isSimpleSingleGroup(group.value)
              ? targetMealName
              : group.value.name)) ||
          'Erro: Grupo sem nome'
        }
        targetNameColor={
          group.value && isSimpleSingleGroup(group.value)
            ? 'text-green-500'
            : 'text-orange-400'
        }
        foodItem={computed(() => {
          console.debug(
            `[ExternalFoodItemEditModal] <computed> foodItem: `,
            editSelection.value?.foodItem,
          )
          return (
            editSelection.value?.foodItem ??
            createFoodItem({ name: 'Bug: selection was null', reference: 0 })
          )
        })}
        onApply={async (item) => {
          if (!group.value) {
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

          console.debug(
            `[ExternalFoodItemEditModal] onApply: setting itemId=${item.id} to item=`,
            item,
          )
          const newGroup: ItemGroup = new ItemGroupEditor(group.value)
            .editItem(item.id, (editor) => editor?.replace(item))
            .finish()

          console.debug('newGroup', newGroup)
          handleCloseWithChanges(newGroup)
        }}
        onDelete={async (itemId) => {
          if (!group.value) {
            console.error('group is null')
            throw new Error('group is null')
          }

          const newGroup: ItemGroup = new ItemGroupEditor(group.value)
            .deleteItem(itemId)
            .finish()

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
  const { group } = useItemGroupEditContext()

  const handleNewItemGroup = async (newGroup: ItemGroup) => {
    console.debug('onNewItemGroup', newGroup)

    if (!group.value) {
      console.error('group is null')
      throw new Error('group is null')
    }

    if (!isSimpleSingleGroup(newGroup)) {
      // TODO: Handle non-simple groups on handleNewItemGroup
      console.error('TODO: Handle non-simple groups')
      alert('TODO: Handle non-simple groups') // TODO: Change all alerts with ConfirmModal
      return
    }

    const finalGroup: ItemGroup = new ItemGroupEditor(group.value)
      .addItem(newGroup.items[0])
      .finish()

    console.debug(
      'onNewFoodItem: applying',
      JSON.stringify(finalGroup, null, 2),
    )

    group.value = finalGroup
  }

  const handleFinishSearch = () => {
    visible.value = false
    // onRefetch()
  }

  useSignalEffect(() => {
    if (!visible.value) {
      console.debug(`[ExternalTemplateSearchModal] onRefetch`)
      onRefetch()
    }
  })

  return (
    <ModalContextProvider visible={visible}>
      <TemplateSearchModal
        targetName={
          group.value?.name ?? 'ERRO: Grupo de alimentos não especificado'
        }
        onFinish={handleFinishSearch}
        onNewItemGroup={handleNewItemGroup}
      />
    </ModalContextProvider>
  )
}

// TODO: Unify Header, Content and Actions for each component in the entire app
/**
 * @deprecated
 */
function Body({
  recipe,
  isFoodFavorite,
  setFoodAsFavorite,
  recipeEditModalVisible,
  foodItemEditModalVisible,
  templateSearchModalVisible,
}: {
  recipe: ReadonlySignal<Recipe | null>
  isFoodFavorite: (foodId: number) => boolean
  setFoodAsFavorite: (foodId: number, isFavorite: boolean) => void
  recipeEditModalVisible: Signal<boolean>
  foodItemEditModalVisible: Signal<boolean>
  templateSearchModalVisible: Signal<boolean>
}) {
  const acceptedClipboardSchema = foodItemSchema.or(itemGroupSchema)

  const { group } = useItemGroupEditContext()

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

  const hasValidPastableOnClipboard = clipboardText.value.length > 0

  const handlePasteAfterConfirm = useCallback(() => {
    const data = deserializeClipboard(
      clipboardText.value,
      acceptedClipboardSchema,
    )

    if (!data) {
      throw new Error('Invalid clipboard data: ' + clipboardText)
    }

    if (!group.value) {
      throw new Error('BUG: group is null')
    }

    if ('items' in data) {
      // data is an itemGroup
      const newGroup = new ItemGroupEditor(group.value)
        .addItems(data.items.map((item) => regenerateId(item)))
        .finish()
      group.value = newGroup
    } else {
      const newGroup = new ItemGroupEditor(group.value)
        .addItem(regenerateId(data))
        .finish()
      group.value = newGroup
    }

    // Clear clipboard
    clearClipboard()
  }, [acceptedClipboardSchema, clipboardText, group, clearClipboard])

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

  if (!group.value) {
    return <></>
  }

  return (
    <>
      <div className="text-md mt-4">
        <div className="flex gap-4">
          <div className="my-auto flex-1">
            <input
              className="input w-full"
              type="text"
              onChange={(e) => {
                if (!group.value) {
                  console.error('group is null')
                  throw new Error('group is null')
                }
                group.value = new ItemGroupEditor(group.value)
                  .setName(e.target.value)
                  .finish()
              }}
              onFocus={(e) => e.target.select()}
              value={group.value.name ?? ''}
            />
          </div>
          {hasValidPastableOnClipboard && (
            <div
              className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
              onClick={() => {
                if (isRecipeTooComplex(recipe.value)) {
                  alert(
                    'Os itens desse grupo não podem ser editados. Motivo: a receita é muito complexa, ainda não é possível editar receitas complexas',
                  )
                  return
                }

                handlePaste()
              }}
            >
              <PasteIcon />
            </div>
          )}

          {group.value.type === 'simple' && (
            <>
              <button
                className="my-auto ml-auto"
                onClick={() => {
                  batch(async () => {
                    if (group.value === null) {
                      console.error('group is null')
                      throw new Error('group is null')
                    }

                    if (currentUserId.value === null) {
                      console.error('currentUserId is null')
                      throw new Error('currentUserId is null')
                    }

                    const newRecipe = createRecipe({
                      name:
                        group.value.name ||
                        'Nova receita (a partir de um grupo)',
                      items: deepCopy(group.value.items) ?? [],
                      owner: currentUserId.value,
                    })

                    const insertedRecipe =
                      await recipeRepository.insertRecipe(newRecipe)

                    if (insertedRecipe === null) {
                      alert(
                        'Falha ao criar receita a partir de grupo (erro ao conversar com banco de dados)',
                      )
                      console.error('insertedRecipe is null')
                      throw new Error('insertedRecipe is null')
                    }

                    group.value = new ItemGroupEditor(group.value)
                      .setRecipe(insertedRecipe.id)
                      .finish()

                    recipeEditModalVisible.value = true
                  })
                }}
              >
                <ConvertToRecipeIcon />
              </button>
            </>
          )}

          {group.value.type === 'recipe' && (
            <>
              {recipe.value !== null ? (
                isRecipedGroupUpToDate(group.value, recipe.value) ? (
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
                      if (recipe.value === null) {
                        return
                      }

                      if (group.value === null) {
                        console.error('group is null')
                        throw new Error('group is null')
                      }

                      const newGroup = new ItemGroupEditor(group.value)
                        .clearItems()
                        .addItems(recipe.value.items)
                        .finish()

                      group.value = newGroup
                    }}
                  >
                    <DownloadIcon />
                  </button>
                )
              ) : (
                <>Receita não encontrada</>
              )}
            </>
          )}
        </div>
      </div>

      <FoodItemListView
        foodItems={computed(() => group.value?.items ?? [])}
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

          if (isRecipeTooComplex(recipe.value)) {
            alert(
              'Os itens desse grupo não podem ser editados. Motivo: a receita é muito complexa, ainda não é possível editar receitas complexas',
            )
            return
          }

          editSelection.value = { foodItem: item }
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
                onCopyItem={(item) => writeToClipboard(JSON.stringify(item))}
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
      {group.value.type === 'recipe' && group.value.recipe !== null && (
        <PreparedQuantity
          // TODO: Remove as unknown as Signal<RecipedItemGroup>
          recipedGroup={group as unknown as Signal<RecipedItemGroup | null>}
          recipe={recipe.value}
        />
      )}
    </>
  )
}

// TODO: Unify Header, Content and Actions for each component in the entire app
/**
 * @deprecated
 */
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
            if (!group.value || !onDelete) {
              alert('BUG: group or onDelete is null') // TODO: Change all alerts with ConfirmModal
            }
            showConfirmModal({
              title: 'Excluir grupo',
              body: `Tem certeza que deseja excluir o grupo ${
                group.value?.name ?? 'BUG: group is null' // TODO: Color group name orange and BUG red
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
                    group.value && onDelete(group.value.id)
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
        disabled={!canApply}
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

function PreparedQuantity({
  recipedGroup,
  recipe,
}: {
  recipedGroup: Signal<RecipedItemGroup | null>
  recipe: Recipe | null
}) {
  const rawQuantiy = computed(
    () =>
      recipedGroup.value?.items.reduce((acc, item) => {
        return acc + item.quantity
      }, 0),
  )

  const initialPreparedQuantity = computed(
    () => (rawQuantiy.value ?? 0) * (recipe?.prepared_multiplier ?? 1),
  )

  const preparedQuantity = useSignal(initialPreparedQuantity.value)

  useSignalEffect(() => {
    preparedQuantity.value = initialPreparedQuantity.value
  })

  const preparedQuantityField = useFloatField(preparedQuantity, {
    decimalPlaces: 0,
  })

  return (
    <div className="flex gap-2">
      <FloatInput
        field={preparedQuantityField}
        commitOn="change"
        className="input px-0 pl-5 text-md"
        onFocus={(event) => event.target.select()}
        onFieldCommit={(newPreparedQuantity) => {
          console.debug(
            `[PreparedQuantity] onFieldCommit: `,
            newPreparedQuantity,
          )

          const newRawQuantity =
            (newPreparedQuantity ?? 0) / (recipe?.prepared_multiplier ?? 1)

          const mult = newRawQuantity / (rawQuantiy.value ?? 1)

          const newItems =
            recipedGroup.value?.items.map((item) => {
              return {
                ...item,
                quantity: item.quantity * mult,
              }
            }) ?? []

          const newGroup =
            recipedGroup.value &&
            new ItemGroupEditor(recipedGroup.value).setItems(newItems).finish()

          recipedGroup.value = recipedItemGroup.parse(newGroup)
        }}
        style={{ width: '100%' }}
      />
    </div>
  )
}

function isRecipeTooComplex(recipe: Recipe | null) {
  return recipe !== null && recipe.prepared_multiplier !== 1
}

export default ItemGroupEditModal
