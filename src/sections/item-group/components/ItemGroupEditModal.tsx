import {
  type ItemGroup,
  type RecipedItemGroup,
  isSimpleSingleGroup,
  itemGroupSchema,
  recipedItemGroupSchema,
} from '~/modules/diet/item-group/domain/itemGroup'
import { Modal, ModalActions } from '~/sections/common/components/Modal'
import { FoodItemListView } from '~/sections/food-item/components/FoodItemListView'
import {
  FoodItemCopyButton,
  FoodItemFavorite,
  FoodItemHeader,
  FoodItemName,
} from '~/sections/food-item/components/FoodItemView'
import {
  type FoodItem,
  createFoodItem,
  foodItemSchema,
} from '~/modules/diet/food-item/domain/foodItem'
import { TemplateSearchModal } from '~/sections/search/components/TemplateSearchModal'
import { FoodItemEditModal } from '~/sections/food-item/components/FoodItemEditModal'
import { RecipeIcon } from '~/sections/common/components/icons/RecipeIcon'
import { RecipeEditModal } from '~/sections/recipe/components/RecipeEditModal'
import { type Recipe, createRecipe } from '~/modules/diet/recipe/domain/recipe'
import { type Loadable } from '~/legacy/utils/loadable'

import {
  ItemGroupEditContextProvider,
  useItemGroupEditContext,
} from '~/sections/item-group/context/ItemGroupEditContext'
import {
  ModalContextProvider,
  useModalContext,
} from '~/sections/common/context/ModalContext'
import { isRecipedGroupUpToDate } from '~/legacy/utils/groupUtils'
import { DownloadIcon } from '~/sections/common/components/icons/DownloadIcon'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { useClipboard } from '~/sections/common/hooks/useClipboard'
import { PasteIcon } from '~/sections/common/components/icons/PasteIcon'
import { deserializeClipboard } from '~/legacy/utils/clipboardUtils'
import { regenerateId } from '~/legacy/utils/idUtils'
import { ItemGroupEditor } from '~/legacy/utils/data/itemGroupEditor'
import { ConvertToRecipeIcon } from '~/sections/common/components/icons/ConvertToRecipeIcon'
import { deepCopy } from '~/legacy/utils/deepCopy'
import { useFloatField } from '~/sections/common/hooks/useField'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import {
  currentUserId,
  isFoodFavorite,
  setFoodAsFavorite,
} from '~/modules/user/application/user'
import {
  type Accessor,
  createSignal,
  type Setter,
  createEffect,
  Show,
} from 'solid-js'
import { createMirrorSignal } from '~/sections/common/hooks/createMirrorSignal'
import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { macroTarget } from '~/modules/diet/macro-target/application/macroTarget'
import { stringToDate } from '~/legacy/utils/dateUtils'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { calcDayMacros, calcItemMacros } from '~/legacy/utils/macroMath'

// TODO: Use repository pattern through use cases instead of directly using repositories
const recipeRepository = createSupabaseRecipeRepository()

type EditSelection = {
  foodItem: FoodItem
} | null

const [editSelection, setEditSelection] = createSignal<EditSelection>(null)

export type ItemGroupEditModalProps = {
  show?: boolean
  targetMealName: string
  onSaveGroup: (item: ItemGroup) => void
  onCancel?: () => void
  onDelete?: (groupId: ItemGroup['id']) => void
  onRefetch: () => void
  group: Accessor<ItemGroup | null>
  setGroup: (group: ItemGroup | null) => void
}

export const ItemGroupEditModal = (props: ItemGroupEditModalProps) => {
  return (
    <ItemGroupEditContextProvider
      group={props.group}
      setGroup={props.setGroup}
      onSaveGroup={props.onSaveGroup}
    >
      <InnerItemGroupEditModal {...props} />
    </ItemGroupEditContextProvider>
  )
}

const InnerItemGroupEditModal = (props: ItemGroupEditModalProps) => {
  const { visible, setVisible } = useModalContext()
  const { group, setGroup } = useItemGroupEditContext()
  const { show: showConfirmModal } = useConfirmModalContext()
  const [recipeEditModalVisible, setRecipeEditModalVisible] =
    createSignal(false)
  const [foodItemEditModalVisible, setFoodItemEditModalVisible] =
    createSignal(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    createSignal(false)

  const [recipeSignal, setRecipeSignal] = createSignal<Loadable<Recipe | null>>(
    {
      loading: true,
    },
  )

  createEffect(() => {
    const group_ = group()
    if (group_ === null || group_.type !== 'recipe') {
      setRecipeSignal({ loading: false, errored: false, data: null })
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
              const group_ = group()
              if (group_ === null) {
                console.warn('group is null, cannot unlink recipe')
                return
              }

              setGroup(
                new ItemGroupEditor(group_).setRecipe(undefined).finish(),
              )
            },
          },
        ],
      })
    }

    recipeRepository
      .fetchRecipeById(group_.recipe)
      .then((recipe) => {
        setRecipeSignal({ loading: false, errored: false, data: recipe })
        if (recipe === null) {
          console.warn('Recipe not found, showing modal to unlink recipe')
          setTimeout(() => {
            handleRecipeNotFound()
          }, 1000)
        }
      })
      .catch((e) => {
        setRecipeSignal({ loading: false, errored: true, error: e })
      })
  })

  const canApply = (group()?.name.length ?? 0) > 0 && editSelection() === null

  return (
    <Show
      when={(() => {
        const recipe_ = recipeSignal()
        return !recipe_.loading && !recipe_.errored && recipe_
      })()}
    >
      {(recipeSignal) => (
        <>
          <ExternalRecipeEditModal
            recipe={recipeSignal().data}
            setRecipe={(recipe) =>
              setRecipeSignal({
                loading: false,
                errored: false,
                data: recipe,
              })
            }
            visible={recipeEditModalVisible}
            setVisible={setRecipeEditModalVisible}
            onRefetch={props.onRefetch}
          />
          <ExternalFoodItemEditModal
            visible={foodItemEditModalVisible}
            setVisible={setFoodItemEditModalVisible}
            onClose={() => setEditSelection(null)}
            targetMealName={props.targetMealName}
          />
          <ExternalTemplateSearchModal
            visible={templateSearchModalVisible}
            setVisible={setTemplateSearchModalVisible}
            onRefetch={props.onRefetch}
          />
          <ModalContextProvider visible={visible} setVisible={setVisible}>
            <Modal
              class="border-2 border-orange-800"
              hasBackdrop={true}
              header={
                <Header
                  recipe={recipeSignal().data}
                  targetMealName={props.targetMealName}
                />
              }
              body={
                <Body
                  recipe={() => {
                    const recipe_ = recipeSignal()
                    return !recipe_.loading && !recipe_.errored
                      ? recipe_.data
                      : null
                  }}
                  isFoodFavorite={isFoodFavorite}
                  setFoodAsFavorite={setFoodAsFavorite}
                  foodItemEditModalVisible={foodItemEditModalVisible}
                  setFoodItemEditModalVisible={setFoodItemEditModalVisible}
                  templateSearchModalVisible={templateSearchModalVisible}
                  setTemplateSearchModalVisible={setTemplateSearchModalVisible}
                  recipeEditModalVisible={recipeEditModalVisible}
                  setRecipeEditModalVisible={setRecipeEditModalVisible}
                />
              }
              actions={
                <Actions
                  canApply={canApply}
                  visible={visible}
                  setVisible={setVisible}
                  onCancel={props.onCancel}
                  onDelete={props.onDelete}
                />
              }
            />
          </ModalContextProvider>
        </>
      )}
    </Show>
  )
}

// TODO: Unify Header, Content and Actions for each component in the entire app
/**
 * @deprecated
 */
function Header(props: { targetMealName: string; recipe: Recipe | null }) {
  return (
    <>
      <h3 class="text-lg font-bold text-white">
        Editando grupo em
        <span class="text-green-500"> &quot;{props.targetMealName}&quot; </span>
      </h3>
      Receita: {props.recipe?.name?.toString() ?? 'Nenhuma'}
    </>
  )
}

function ExternalRecipeEditModal(props: {
  recipe: Recipe | null
  setRecipe: (recipe: Recipe | null) => void
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onRefetch: () => void
}) {
  return (
    <Show when={props.recipe}>
      {(recipe) => (
        <ModalContextProvider
          visible={props.visible}
          setVisible={props.setVisible}
        >
          <RecipeEditModal
            recipe={recipe()}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSaveRecipe={(recipe) => {
              console.debug(
                '[ItemGroupEditModal::ExternalRecipeEditModal] onSaveRecipe:',
                recipe,
              )
              recipeRepository
                .updateRecipe(recipe.id, recipe)
                .then(props.setRecipe)
                .catch((e) => {
                  console.error(
                    '[ItemGroupEditModal::ExternalRecipeEditModal] Error updating recipe:',
                    e,
                  )
                  alert('Erro ao salvar receita')
                })
            }}
            onRefetch={props.onRefetch}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onDelete={(recipeId) => {
              console.debug(
                '[ItemGroupEditModal::ExternalRecipeEditModal] onDelete:',
                recipeId,
              )

              const afterDelete = () => {
                props.setRecipe(null)
              }

              recipeRepository
                .deleteRecipe(recipeId)
                .then(afterDelete)
                .catch((e) => {
                  console.error(
                    '[ItemGroupEditModal::ExternalRecipeEditModal] Error deleting recipe:',
                    e,
                  )
                  alert('Erro ao deletar receita')
                })
            }}
          />
        </ModalContextProvider>
      )}
    </Show>
  )
}

function ExternalFoodItemEditModal(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  targetMealName: string
  onClose: () => void
}) {
  const { group, persistentGroup, setGroup } = useItemGroupEditContext()

  const { show: showConfirmModal } = useConfirmModalContext()

  const handleCloseWithNoChanges = () => {
    props.setVisible(false)
    props.onClose()
  }

  const handleCloseWithChanges = (newGroup: ItemGroup) => {
    if (group() === null) {
      console.error('group is null')
      throw new Error('group is null')
    }

    console.debug(
      '[ExternalFoodItemEditModal] handleCloseWithChanges - newGroup: ',
      newGroup,
    )
    setGroup(newGroup)
    props.setVisible(false)
    props.onClose()
  }

  createEffect(() => {
    if (!props.visible()) {
      handleCloseWithNoChanges()
    }
  })

  const macroOverflow = () => {
    const persistentGroup_ = persistentGroup()
    if (persistentGroup_ === null) {
      return {
        enable: false,
      }
    }

    const item = editSelection()?.foodItem
    if (item === undefined) {
      return {
        enable: false,
      }
    }

    // Get the original item from the persistent group
    const originalItem = persistentGroup_.items.find((i) => i.id === item.id)

    if (originalItem === undefined) {
      console.error('[ExternalFoodItemEditModal] originalItem is not found')
      return {
        enable: false,
      }
    }

    return {
      enable: true,
      originalItem,
    }
  }

  return (
    <ModalContextProvider visible={props.visible} setVisible={props.setVisible}>
      <FoodItemEditModal
        targetName={(() => {
          const group_ = group()

          if (group_ !== null) {
            const simpleGroup = group_ !== null && isSimpleSingleGroup(group_)
            const receivedName = simpleGroup
              ? props.targetMealName
              : group_.name
            return receivedName.length > 0 ? receivedName : 'Erro: Nome vazio'
          }

          return 'Erro: Grupo de alimentos nulo'
        })()}
        targetNameColor={(() => {
          const group_ = group()
          return group_ !== null && isSimpleSingleGroup(group_)
            ? 'text-green-500'
            : 'text-orange-400'
        })()}
        foodItem={() => {
          console.debug(
            '[ExternalFoodItemEditModal] <computed> foodItem: ',
            editSelection()?.foodItem,
          )
          return (
            editSelection()?.foodItem ??
            createFoodItem({ name: 'Bug: selection was null', reference: 0 })
          )
        }}
        macroOverflow={macroOverflow}
        onApply={(item) => {
          const group_ = group()
          if (group_ === null) {
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

          // TODO: Move isOverflow to a specialized module
          const isOverflow = (property: keyof MacroNutrients) => {
            console.log(`[FoodItemNutritionalInfo] isOverflow`)

            if (!macroOverflow().enable) {
              return false
            }

            const currentDayDiet_ = currentDayDiet()
            if (currentDayDiet_ === null) {
              console.error(
                '[FoodItemNutritionalInfo] currentDayDiet is undefined, cannot calculate overflow',
              )
              return false
            }

            const macroTarget_ = macroTarget(stringToDate(targetDay()))
            if (macroTarget_ === null) {
              console.error(
                '[FoodItemNutritionalInfo] macroTarget is undefined, cannot calculate overflow',
              )
              return false
            }
            const originalItem_ = macroOverflow().originalItem

            const itemMacros = calcItemMacros(item)
            const originalItemMacros: MacroNutrients =
              originalItem_ !== undefined
                ? calcItemMacros(originalItem_)
                : {
                    carbs: 0,
                    protein: 0,
                    fat: 0,
                  }

            const difference =
              originalItem_ !== undefined
                ? itemMacros[property] - originalItemMacros[property]
                : itemMacros[property]

            const current = calcDayMacros(currentDayDiet_)[property]
            const target = macroTarget_[property]

            console.log(
              `[FoodItemNutritionalInfo] ${property} difference:`,
              difference,
            )

            return current + difference > target
          }

          const onConfirm = () => {
            console.debug(
              `[ExternalFoodItemEditModal] onApply: setting itemId=${item.id} to item=`,
              item,
            )
            const newGroup: ItemGroup = new ItemGroupEditor(group_)
              .editItem(item.id, (editor) => editor?.replace(item))
              .finish()

            console.debug('newGroup', newGroup)
            handleCloseWithChanges(newGroup)
          }

          const isOverflowing =
            isOverflow('carbs') || isOverflow('protein') || isOverflow('fat')
          if (isOverflowing) {
            showConfirmModal({
              title: 'Macronutrientes excedem metas diárias',
              body: 'Os macronutrientes desse item excedem as metas diárias. Deseja continuar mesmo assim?',
              actions: [
                {
                  text: 'Cancelar',
                  onClick: () => undefined,
                },
                {
                  text: 'Continuar',
                  primary: true,
                  onClick: onConfirm,
                },
              ],
            })
          } else {
            onConfirm()
          }
        }}
        onDelete={(itemId) => {
          const group_ = group()
          if (group_ === null) {
            console.error('group is null')
            throw new Error('group is null')
          }

          const newGroup: ItemGroup = new ItemGroupEditor(group_)
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
function ExternalTemplateSearchModal(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onRefetch: () => void
}) {
  const { group, setGroup } = useItemGroupEditContext()

  const handleNewItemGroup = (newGroup: ItemGroup) => {
    console.debug('onNewItemGroup', newGroup)

    const group_ = group()
    if (group_ === null) {
      console.error('group is null')
      throw new Error('group is null')
    }

    if (!isSimpleSingleGroup(newGroup)) {
      // TODO: Handle non-simple groups on handleNewItemGroup
      console.error('TODO: Handle non-simple groups')
      alert('TODO: Handle non-simple groups') // TODO: Change all alerts with ConfirmModal
      return
    }

    const finalGroup: ItemGroup = new ItemGroupEditor(group_)
      .addItem(newGroup.items[0])
      .finish()

    console.debug(
      'onNewFoodItem: applying',
      JSON.stringify(finalGroup, null, 2),
    )

    setGroup(finalGroup)
  }

  const handleFinishSearch = () => {
    props.setVisible(false)
    // onRefetch()
  }

  createEffect(() => {
    if (!props.visible()) {
      console.debug('[ExternalTemplateSearchModal] onRefetch')
      props.onRefetch()
    }
  })

  return (
    <ModalContextProvider visible={props.visible} setVisible={props.setVisible}>
      <TemplateSearchModal
        targetName={
          group()?.name ?? 'ERRO: Grupo de alimentos não especificado'
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
function Body(props: {
  recipe: Accessor<Recipe | null>
  isFoodFavorite: (foodId: number) => boolean
  setFoodAsFavorite: (foodId: number, isFavorite: boolean) => void
  recipeEditModalVisible: Accessor<boolean>
  setRecipeEditModalVisible: Setter<boolean>
  foodItemEditModalVisible: Accessor<boolean>
  setFoodItemEditModalVisible: Setter<boolean>
  templateSearchModalVisible: Accessor<boolean>
  setTemplateSearchModalVisible: Setter<boolean>
}) {
  const acceptedClipboardSchema = foodItemSchema.or(itemGroupSchema)

  const { group, setGroup } = useItemGroupEditContext()

  const {
    write: writeToClipboard,
    clear: clearClipboard,
    clipboard: clipboardText,
  } = useClipboard({
    filter: (clipboard) => {
      if (clipboard === '') return false
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

  const hasValidPastableOnClipboard = () => clipboardText().length > 0

  const handlePasteAfterConfirm = () => {
    const data = deserializeClipboard(clipboardText(), acceptedClipboardSchema)

    if (data === null) {
      throw new Error('Invalid clipboard data: ' + clipboardText())
    }
    const group_ = group()
    if (group_ === null) {
      throw new Error('BUG: group is null')
    }

    if ('items' in data) {
      // data is an itemGroup
      const newGroup = new ItemGroupEditor(group_)
        .addItems(data.items.map((item) => regenerateId(item)))
        .finish()
      setGroup(newGroup)
    } else {
      const newGroup = new ItemGroupEditor(group_)
        .addItem(regenerateId(data))
        .finish()
      setGroup(newGroup)
    }

    // Clear clipboard
    clearClipboard()
  }

  const handlePaste = () => {
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
  }

  return (
    <Show when={group()}>
      {(group) => (
        <>
          <div class="text-md mt-4">
            <div class="flex gap-4">
              <div class="my-auto flex-1">
                <input
                  class="input w-full"
                  type="text"
                  onChange={(e) => {
                    setGroup(
                      new ItemGroupEditor(group())
                        .setName(e.target.value)
                        .finish(),
                    )
                  }}
                  onFocus={(e) => {
                    e.target.select()
                  }}
                  value={group().name}
                />
              </div>
              <Show when={hasValidPastableOnClipboard()}>
                {(_) => (
                  <div
                    class={
                      'btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105'
                    }
                    onClick={() => {
                      if (isRecipeTooComplex(props.recipe())) {
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
              </Show>

              <Show when={group().type === 'simple'}>
                {(_) => (
                  <>
                    <button
                      class="my-auto ml-auto"
                      onClick={() => {
                        const exec = async () => {
                          const group_ = group()
                          if (group_ === null) {
                            console.error('group is null')
                            throw new Error('group is null')
                          }

                          const newRecipe = createRecipe({
                            name:
                              group_.name.length > 0
                                ? group_.name
                                : 'Nova receita (a partir de um grupo)',
                            items: deepCopy(group_.items) ?? [],
                            owner: currentUserId(),
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

                          setGroup(
                            new ItemGroupEditor(group_)
                              .setRecipe(insertedRecipe.id)
                              .finish(),
                          )

                          props.setRecipeEditModalVisible(true)
                        }

                        exec().catch((err) => {
                          console.error(
                            '[ItemGroupEditModal] Error creating recipe from group:',
                            err,
                          )
                          alert(
                            'Falha ao criar receita a partir de grupo (erro interno)',
                          )
                        })
                      }}
                    >
                      <ConvertToRecipeIcon />
                    </button>
                  </>
                )}
              </Show>

              <Show
                when={(() => {
                  const group_ = group()
                  return group_.type === 'recipe' && group_
                })()}
              >
                {(group) => (
                  <>
                    <Show when={props.recipe()}>
                      {(recipe) => (
                        <>
                          <Show
                            when={isRecipedGroupUpToDate(group(), recipe())}
                          >
                            {(_) => (
                              <button
                                class="my-auto ml-auto"
                                onClick={() => {
                                  // TODO: Create recipe for groups that don't have one
                                  props.setRecipeEditModalVisible(true)
                                }}
                              >
                                <RecipeIcon />
                              </button>
                            )}
                          </Show>

                          <Show
                            when={!isRecipedGroupUpToDate(group(), recipe())}
                          >
                            {(_) => (
                              <button
                                class="my-auto ml-auto hover:animate-pulse"
                                onClick={() => {
                                  if (props.recipe() === null) {
                                    return
                                  }

                                  if (group() === null) {
                                    console.error('group is null')
                                    throw new Error('group is null')
                                  }

                                  const newGroup = new ItemGroupEditor(group())
                                    .clearItems()
                                    .addItems(recipe().items)
                                    .finish()

                                  setGroup(newGroup)
                                }}
                              >
                                <DownloadIcon />
                              </button>
                            )}
                          </Show>
                        </>
                      )}
                    </Show>

                    <Show when={props.recipe() === null}>
                      {(_) => <>Receita não encontrada</>}
                    </Show>
                  </>
                )}
              </Show>
            </div>
          </div>

          <FoodItemListView
            foodItems={() => group()?.items ?? []}
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

              if (isRecipeTooComplex(props.recipe())) {
                alert(
                  'Os itens desse grupo não podem ser editados. Motivo: a receita é muito complexa, ainda não é possível editar receitas complexas',
                )
                return
              }

              setEditSelection({ foodItem: item })
              props.setFoodItemEditModalVisible(true)
              // }
            }}
            makeHeaderFn={(item) => (
              <FoodItemHeader
                name={<FoodItemName />}
                favorite={
                  <FoodItemFavorite
                    favorite={props.isFoodFavorite(item.reference)}
                    onSetFavorite={(favorite) => {
                      props.setFoodAsFavorite(item.reference, favorite)
                    }}
                  />
                }
                copyButton={
                  <FoodItemCopyButton
                    onCopyItem={(item) => {
                      writeToClipboard(JSON.stringify(item))
                    }}
                  />
                }
              />
            )}
          />

          <button
            class="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            onClick={() => {
              props.setTemplateSearchModalVisible(true)
            }}
          >
            Adicionar item
          </button>
          {group().type === 'recipe' && group().recipe !== null && (
            <PreparedQuantity
              // TODO: Remove as unknown as Accessor<RecipedItemGroup>
              recipedGroup={
                group as unknown as Accessor<RecipedItemGroup | null>
              }
              setRecipedGroup={
                setGroup as unknown as Setter<RecipedItemGroup | null>
              }
              recipe={props.recipe()}
            />
          )}
        </>
      )}
    </Show>
  )
}

// TODO: Unify Header, Content and Actions for each component in the entire app
/**
 * @deprecated
 */
function Actions(props: {
  onDelete?: (groupId: number) => void
  onCancel?: () => void
  canApply: boolean
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
}) {
  // TODO: Make itemGroup not nullable? Reflect changes on all group?. and itemGroup?. and ?? everywhere
  const { group, saveGroup } = useItemGroupEditContext()

  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <ModalActions>
      {/* if there is a button in form, it will close the modal */}
      <Show when={props.onDelete}>
        {(onDelete) => (
          <button
            class="btn-error btn mr-auto"
            onClick={(e) => {
              e.preventDefault()
              if (group() === null) {
                alert('BUG: group or onDelete is null') // TODO: Change all alerts with ConfirmModal
              }
              showConfirmModal({
                title: 'Excluir grupo',
                body: `Tem certeza que deseja excluir o grupo ${
                  group()?.name ?? 'BUG: group is null' // TODO: Color group name orange and BUG red
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
                      const group_ = group()
                      group_ !== null && onDelete()(group_.id)
                    },
                  },
                ],
              })
            }}
          >
            Excluir
          </button>
        )}
      </Show>
      <button
        class="btn"
        onClick={(e) => {
          e.preventDefault()
          props.setVisible(false)
          props.onCancel?.()
        }}
      >
        Cancelar
      </button>
      <button
        class="btn"
        disabled={!props.canApply}
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

function PreparedQuantity(props: {
  recipedGroup: Accessor<RecipedItemGroup | null>
  setRecipedGroup: Setter<RecipedItemGroup | null>
  recipe: Recipe | null
}) {
  const rawQuantity = () =>
    props.recipedGroup()?.items.reduce((acc, item) => {
      return acc + item.quantity
    }, 0)

  const initialPreparedQuantity = () =>
    (rawQuantity() ?? 0) * (props.recipe?.prepared_multiplier ?? 1)

  // TODO: Allow user to edit prepared quantity directly
  const [preparedQuantity] = createMirrorSignal(initialPreparedQuantity)

  const preparedQuantityField = useFloatField(preparedQuantity, {
    decimalPlaces: 0,
  })

  return (
    <div class="flex gap-2">
      <FloatInput
        field={preparedQuantityField}
        commitOn="change"
        class="input px-0 pl-5 text-md"
        onFocus={(event) => {
          event.target.select()
        }}
        onFieldCommit={(newPreparedQuantity) => {
          console.debug(
            '[PreparedQuantity] onFieldCommit: ',
            newPreparedQuantity,
          )

          const newRawQuantity =
            (newPreparedQuantity ?? 0) /
            (props.recipe?.prepared_multiplier ?? 1)

          const multiplier = newRawQuantity / (rawQuantity() ?? 1)

          const newItems =
            props.recipedGroup()?.items.map((item) => {
              return {
                ...item,
                quantity: item.quantity * multiplier,
              }
            }) ?? []

          const recipedGroup_ = props.recipedGroup()
          const newGroup =
            recipedGroup_ !== null &&
            new ItemGroupEditor(recipedGroup_).setItems(newItems).finish()

          props.setRecipedGroup(recipedItemGroupSchema.parse(newGroup))
        }}
        style={{ width: '100%' }}
      />
    </div>
  )
}

function isRecipeTooComplex(recipe: Recipe | null) {
  return recipe !== null && recipe.prepared_multiplier !== 1
}
