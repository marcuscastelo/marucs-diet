import {
  type ItemGroup,
  type RecipedItemGroup,
  isSimpleSingleGroup,
  itemGroupSchema,
  recipedItemGroupSchema,
  getItemGroupQuantity,
} from '~/modules/diet/item-group/domain/itemGroup'
import { Modal } from '~/sections/common/components/Modal'
import { ItemListView } from '~/sections/food-item/components/ItemListView'
import {
  ItemCopyButton,
  ItemFavorite,
  ItemHeader,
  ItemName,
} from '~/sections/food-item/components/ItemView'
import {
  type Item,
  createItem,
  itemSchema,
} from '~/modules/diet/item/domain/item'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { ExternalTemplateSearchModal } from '~/sections/search/components/ExternalTemplateSearchModal'
import { ExternalItemEditModal } from '~/sections/food-item/components/ExternalItemEditModal'
import { RecipeIcon } from '~/sections/common/components/icons/RecipeIcon'
import { type Recipe, createRecipe } from '~/modules/diet/recipe/domain/recipe'
import { ExternalRecipeEditModal } from './ExternalRecipeEditModal'
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
import {
  type ConfirmModalContext,
  useConfirmModalContext,
} from '~/sections/common/context/ConfirmModalContext'
import { useClipboard } from '~/sections/common/hooks/useClipboard'
import { PasteIcon } from '~/sections/common/components/icons/PasteIcon'
import { deserializeClipboard } from '~/legacy/utils/clipboardUtils'
import { regenerateId } from '~/legacy/utils/idUtils'
import { ItemGroupEditor } from '~/legacy/utils/data/itemGroupEditor'
import { ConvertToRecipeIcon } from '~/sections/common/components/icons/ConvertToRecipeIcon'
import { deepCopy } from '~/legacy/utils/deepCopy'
import { PreparedQuantity } from '~/sections/common/components/PreparedQuantity'
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
  untrack,
  createMemo,
} from 'solid-js'
import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { macroTarget } from '~/modules/diet/macro-target/application/macroTarget'
import { stringToDate } from '~/legacy/utils/dateUtils'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { isOverflow } from '~/legacy/utils/macroOverflow'
import toast from 'solid-toast'
import {
  fetchRecipeById,
  insertRecipe,
} from '~/modules/diet/recipe/application/recipe'
import { BrokenLink } from '~/sections/common/components/icons/BrokenLinkIcon'

type EditSelection = {
  item: Item
} | null

const [editSelection, setEditSelection] = createSignal<EditSelection>(null)

export type ItemGroupEditModalProps = {
  show?: boolean
  targetMealName: string
  onSaveGroup: (item: ItemGroup) => void
  onCancel?: () => void
  onDelete?: (groupId: ItemGroup['id']) => void
  onRefetch: () => void
  group: Accessor<ItemGroup>
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

const unlinkRecipe = (signals: {
  group: Accessor<ItemGroup>
  setGroup: Setter<ItemGroup>
}) => {
  signals.setGroup(
    new ItemGroupEditor(signals.group()).setRecipe(undefined).finish(),
  )
}

const askUnlinkRecipe = (
  prompt: string,
  signals: {
    showConfirmModal: ConfirmModalContext['show']
    group: Accessor<ItemGroup>
    setGroup: Setter<ItemGroup>
  },
) => {
  signals.showConfirmModal({
    title: 'Desvincular receita',
    body: prompt,
    actions: [
      {
        text: 'Cancelar',
        onClick: () => undefined,
      },
      {
        text: 'Desvincular',
        primary: true,
        onClick: () => {
          unlinkRecipe(signals)
        },
      },
    ],
  })
}

const InnerItemGroupEditModal = (props: ItemGroupEditModalProps) => {
  const { visible, setVisible } = useModalContext()
  const { group, persistentGroup, setGroup } = useItemGroupEditContext()
  const { show: showConfirmModal } = useConfirmModalContext()
  const [recipeEditModalVisible, setRecipeEditModalVisible] =
    createSignal(false)
  const [itemEditModalVisible, setItemEditModalVisible] =
    createSignal(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    createSignal(false)

  const handleNewItemGroup = (newGroup: ItemGroup) => {
    console.debug('handleNewItemGroup', newGroup)

    const currentGroup = group()
    if (currentGroup === null) {
      console.error('group is null')
      throw new Error('group is null')
    }

    if (!isSimpleSingleGroup(newGroup)) {
      // TODO: Handle non-simple groups on handleNewItemGroup
      console.error('TODO: Handle non-simple groups')
      toast.error(
        'Grupos complexos ainda não são suportados, funcionalidade em desenvolvimento',
      )
      return
    }

    const finalGroup: ItemGroup = new ItemGroupEditor(currentGroup)
      .addItem(newGroup.items[0])
      .finish()

    setGroup(finalGroup)
  }

  const [recipeSignal, setRecipeSignal] = createSignal<Loadable<Recipe | null>>(
    {
      loading: true,
    },
  )

  createEffect(() => {
    const group_ = group()
    if (group_.type !== 'recipe') {
      setRecipeSignal({ loading: false, errored: false, data: null })
      return
    }

    fetchRecipeById(group_.recipe)
      .then((recipe) => {
        setRecipeSignal({ loading: false, errored: false, data: recipe })
      })
      .catch((e) => {
        setRecipeSignal({ loading: false, errored: true, error: e })
      })
  })

  createEffect(() => {
    const group_ = group()
    const groupHasRecipe = group_?.type === 'recipe' && group_?.recipe !== null
    console.debug('Group changed:', group())

    if (groupHasRecipe) {
      setTimeout(() => {
        const recipe_ = untrack(recipeSignal)

        const recipeNotFound =
          !recipe_.loading && !recipe_.errored && recipe_.data === null

        if (recipeNotFound) {
          setTimeout(() => {
            askUnlinkRecipe(
              'A receita atrelada a esse grupo não foi encontrada. Deseja desvincular o grupo da receita?',
              {
                showConfirmModal,
                group,
                setGroup,
              },
            )
          }, 0)
        }
      }, 200)
    }
  })

  const canApply = (group()?.name.length ?? 0) > 0 && editSelection() === null

  const handleItemApply = (item: TemplateItem) => {
    const group_ = group()
    if (group_ === null) {
      console.error('group is null')
      throw new Error('group is null')
    }

    // TODO: Allow user to edit recipe inside a group
    if (item.__type === 'RecipeItem') {
      toast.error(
        'Ainda não é possível editar receitas! Funcionalidade em desenvolvimento',
      )
      return
    }

    const checkOverflow = (property: keyof MacroNutrients) => {
      const macroOverflowOptions = (() => {
        const persistentGroup_ = persistentGroup()
        if (persistentGroup_ === null) {
          return { enable: false }
        }
        const currentItem = editSelection()?.item
        if (currentItem === undefined) {
          return { enable: false }
        }
        const originalItem = persistentGroup_.items.find((i: Item) => i.id === currentItem.id)
        if (originalItem === undefined) {
          console.error('[ExternalItemEditModal] originalItem is not found')
          return { enable: false }
        }
        return { enable: true, originalItem }
      })()

      const currentDayDiet_ = currentDayDiet()
      const macroTarget_ = macroTarget(stringToDate(targetDay()))
      
      return isOverflow(item, property, {
        currentDayDiet: currentDayDiet_,
        macroTarget: macroTarget_,
        macroOverflowOptions
      })
    }

    const onConfirm = () => {
      console.debug(
        `[ExternalItemEditModal] onApply: setting itemId=${item.id} to item=`,
        item,
      )
      const newGroup: ItemGroup = new ItemGroupEditor(group_)
        .editItem(item.id, (editor) => editor?.replace(item))
        .finish()

      console.debug('newGroup', newGroup)
      setGroup(newGroup)
      setEditSelection(null)
    }

    const isOverflowing =
      checkOverflow('carbs') || checkOverflow('protein') || checkOverflow('fat')
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
  }

  const handleItemDelete = (itemId: TemplateItem['id']) => {
    const group_ = group()
    if (group_ === null) {
      console.error('group is null')
      throw new Error('group is null')
    }

    const newGroup: ItemGroup = new ItemGroupEditor(group_)
      .deleteItem(itemId)
      .finish()

    console.debug('newGroup', newGroup)
    setGroup(newGroup)
    setEditSelection(null)
  }

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
          <ExternalItemEditModal
            visible={itemEditModalVisible}
            setVisible={setItemEditModalVisible}
            item={() => {
              console.debug(
                '[ExternalItemEditModal] <computed> item: ',
                editSelection()?.item,
              )
              return (
                editSelection()?.item ??
                createItem({ name: 'Bug: selection was null', reference: 0 })
              )
            }}
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
            macroOverflow={() => {
              const persistentGroup_ = persistentGroup()
              if (persistentGroup_ === null) {
                return { enable: false }
              }
              const item = editSelection()?.item
              if (item === undefined) {
                return { enable: false }
              }
              const originalItem = persistentGroup_.items.find((i: Item) => i.id === item.id)
              if (originalItem === undefined) {
                console.error('[ExternalItemEditModal] originalItem is not found')
                return { enable: false }
              }
              return { enable: true, originalItem }
            }}
            onApply={handleItemApply}
            onDelete={handleItemDelete}
            onClose={() => setEditSelection(null)}
          />
          <ExternalTemplateSearchModal
            visible={templateSearchModalVisible}
            setVisible={setTemplateSearchModalVisible}
            onRefetch={props.onRefetch}
            targetName={group()?.name ?? 'ERRO: Grupo de alimentos não especificado'}
            onNewItemGroup={handleNewItemGroup}
          />
          <ModalContextProvider visible={visible} setVisible={setVisible}>
            <Modal class="border-2 border-orange-800" hasBackdrop={true}>
              <Modal.Header
                title={
                  <Title
                    recipe={recipeSignal().data}
                    targetMealName={props.targetMealName}
                  />
                }
              />
              <Modal.Content>
                <Body
                  recipe={() => recipeSignal().data}
                  isFoodFavorite={isFoodFavorite}
                  setFoodAsFavorite={setFoodAsFavorite}
                  itemEditModalVisible={itemEditModalVisible}
                  setItemEditModalVisible={setItemEditModalVisible}
                  templateSearchModalVisible={templateSearchModalVisible}
                  setTemplateSearchModalVisible={setTemplateSearchModalVisible}
                  recipeEditModalVisible={recipeEditModalVisible}
                  setRecipeEditModalVisible={setRecipeEditModalVisible}
                />
              </Modal.Content>
              <Modal.Footer>
                <Actions
                  canApply={canApply}
                  visible={visible}
                  setVisible={setVisible}
                  onCancel={props.onCancel}
                  onDelete={props.onDelete}
                />
              </Modal.Footer>
            </Modal>
          </ModalContextProvider>
        </>
      )}
    </Show>
  )
}

function Title(props: { targetMealName: string; recipe: Recipe | null }) {
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

function Body(props: {
  recipe: Accessor<Recipe | null>
  isFoodFavorite: (foodId: number) => boolean
  setFoodAsFavorite: (foodId: number, isFavorite: boolean) => void
  recipeEditModalVisible: Accessor<boolean>
  setRecipeEditModalVisible: Setter<boolean>
  itemEditModalVisible: Accessor<boolean>
  setItemEditModalVisible: Setter<boolean>
  templateSearchModalVisible: Accessor<boolean>
  setTemplateSearchModalVisible: Setter<boolean>
}) {
  const acceptedClipboardSchema = itemSchema.or(itemGroupSchema)

  const { group, setGroup } = useItemGroupEditContext()

  const recipedGroup = createMemo(() => {
    const currentGroup = group()
    return currentGroup.type === 'recipe' && currentGroup.recipe !== null ? currentGroup : null
  })

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
                  value={group().name}
                  ref={(ref) => {
                    setTimeout(() => {
                      ref?.blur()
                    }, 0)
                  }}
                />
              </div>

              <div class="flex gap-2 px-2">
                <Show when={hasValidPastableOnClipboard()}>
                  {(_) => (
                    <div
                      class={
                        'btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105'
                      }
                      onClick={() => {
                        if (isRecipeTooComplex(props.recipe())) {
                          toast.error(
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

                            const insertedRecipe = await insertRecipe(newRecipe)

                            if (insertedRecipe === null) {
                              return
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
                            toast.error(
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

                                    const newGroup = new ItemGroupEditor(
                                      group(),
                                    )
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

                            <button
                              class="my-auto ml-auto hover:animate-pulse"
                              onClick={() => {
                                askUnlinkRecipe(
                                  'Deseja desvincular a receita?',
                                  {
                                    showConfirmModal,
                                    group,
                                    setGroup,
                                  },
                                )
                              }}
                            >
                              <BrokenLink />
                            </button>
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
          </div>

          <ItemListView
            items={() => group()?.items ?? []}
            // TODO: Check if this margin was lost
            //   className="mt-4"
            onItemClick={(item) => {
              // TODO: Allow user to edit recipe
              if (item.__type === 'RecipeItem') {
                toast.error(
                  'Ainda não é possível editar receitas! Funcionalidade em desenvolvimento',
                )
                return
              }
              // if (group?.type === 'recipe') {
              //   recipeEditModalRef.current?.showModal()
              // } else {

              if (isRecipeTooComplex(props.recipe())) {
                toast.error(
                  'Os itens desse grupo não podem ser editados. Motivo: a receita é muito complexa, ainda não é possível editar receitas complexas',
                )
                return
              }

              setEditSelection({ item })
              props.setItemEditModalVisible(true)
              // }
            }}
            makeHeaderFn={(item) => (
              <ItemHeader
                name={<ItemName />}
                favorite={
                  <ItemFavorite
                    favorite={props.isFoodFavorite(item.reference)}
                    onSetFavorite={(favorite) => {
                      props.setFoodAsFavorite(item.reference, favorite)
                    }}
                  />
                }
                copyButton={
                  <ItemCopyButton
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
          <Show when={recipedGroup()}>
            {(recipedGroup) => (
              <PreparedQuantityWrapper
                recipedGroup={recipedGroup}
                setRecipedGroup={setGroup}
                recipe={props.recipe()}
              />
            )}
          </Show>
        </>
      )}
    </Show>
  )
}

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
    <>
      {/* if there is a button in form, it will close the modal */}
      <Show when={props.onDelete}>
        {(onDelete) => (
          <button
            class="btn-error btn mr-auto"
            onClick={(e) => {
              e.preventDefault()
              if (group() === null) {
                toast.error('Bug detectado: group ou onDelete é nulo')
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
    </>
  )
}

function PreparedQuantityWrapper(props: {
  recipedGroup: Accessor<RecipedItemGroup>
  setRecipedGroup: Setter<ItemGroup>
  recipe: Recipe | null
}) {
  const rawQuantity = () => getItemGroupQuantity(props.recipedGroup())

  return (
    <PreparedQuantity
      rawQuantity={rawQuantity()}
      preparedMultiplier={props.recipe?.prepared_multiplier ?? 1}
      onPreparedQuantityChange={({ newPreparedQuantity, newMultiplier, newRawQuantity }) => {
        console.debug(
          '[PreparedQuantity] onPreparedQuantityChange: ',
          newPreparedQuantity(),
          'newMultiplier:',
          newMultiplier(),
          'newRawQuantity:',
          newRawQuantity(),
        )

        const newItems = props.recipedGroup().items.map((item) => {
          return {
            ...item,
            quantity: item.quantity * newMultiplier(),
          }
        })

        const newGroup = new ItemGroupEditor(props.recipedGroup())
          .setItems(newItems)
          .finish()

        props.setRecipedGroup(newGroup)
      }}
    />
  )
}

function isRecipeTooComplex(recipe: Recipe | null) {
  return recipe !== null && recipe.prepared_multiplier !== 1
}
