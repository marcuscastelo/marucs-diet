import { z } from 'zod'
import { type Loadable } from '~/legacy/utils/loadable'
import {
  type ItemGroup,
  type RecipedItemGroup,
  getItemGroupQuantity,
  isSimpleSingleGroup,
  itemGroupSchema,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Item, itemSchema } from '~/modules/diet/item/domain/item'
import {
  type Recipe,
  createNewRecipe,
} from '~/modules/diet/recipe/domain/recipe'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { RecipeIcon } from '~/sections/common/components/icons/RecipeIcon'
import { Modal } from '~/sections/common/components/Modal'
import { ExternalItemEditModal } from '~/sections/food-item/components/ExternalItemEditModal'
import { ItemListView } from '~/sections/food-item/components/ItemListView'
import {
  ItemCopyButton,
  ItemFavorite,
  ItemName,
} from '~/sections/food-item/components/ItemView'
import { ExternalTemplateSearchModal } from '~/sections/search/components/ExternalTemplateSearchModal'
import { ExternalRecipeEditModal } from './ExternalRecipeEditModal'

import {
  type Accessor,
  type Setter,
  Show,
  createEffect,
  createMemo,
  createSignal,
  untrack,
} from 'solid-js'
import { deepCopy } from '~/legacy/utils/deepCopy'
import { regenerateId } from '~/legacy/utils/idUtils'
import { isOverflow } from '~/legacy/utils/macroOverflow'
import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { isRecipedGroupUpToDate } from '~/modules/diet/item-group/domain/itemGroup'
import {
  addItemToGroup,
  addItemsToGroup,
  removeItemFromGroup,
  setItemGroupItems,
  setItemGroupRecipe,
  updateItemGroupName,
  updateItemInGroup,
} from '~/modules/diet/item-group/domain/itemGroupOperations'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import {
  fetchRecipeById,
  insertRecipe,
} from '~/modules/diet/recipe/application/recipe'
import { showError } from '~/modules/toast/application/toastManager'
import { currentUserId } from '~/modules/user/application/user'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import { BrokenLink } from '~/sections/common/components/icons/BrokenLinkIcon'
import { ConvertToRecipeIcon } from '~/sections/common/components/icons/ConvertToRecipeIcon'
import { DownloadIcon } from '~/sections/common/components/icons/DownloadIcon'
import { PasteIcon } from '~/sections/common/components/icons/PasteIcon'
import { PreparedQuantity } from '~/sections/common/components/PreparedQuantity'
import {
  type ConfirmModalContext,
  useConfirmModalContext,
} from '~/sections/common/context/ConfirmModalContext'
import {
  ModalContextProvider,
  useModalContext,
} from '~/sections/common/context/ModalContext'
import { useCopyPasteActions } from '~/sections/common/hooks/useCopyPasteActions'
import {
  ItemGroupEditContextProvider,
  useItemGroupEditContext,
} from '~/sections/item-group/context/ItemGroupEditContext'
import { formatError } from '~/shared/formatError'
import { stringToDate } from '~/shared/utils/date'

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
  signals.setGroup(setItemGroupRecipe(signals.group(), undefined))
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
  const [itemEditModalVisible, setItemEditModalVisible] = createSignal(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    createSignal(false)

  const handleNewItemGroup = (newGroup: ItemGroup) => {
    console.debug('handleNewItemGroup', newGroup)

    if (!isSimpleSingleGroup(newGroup)) {
      // TODO:   Handle non-simple groups on handleNewItemGroup
      showError(
        'Grupos complexos ainda não são suportados, funcionalidade em desenvolvimento',
      )
      return
    }

    const newItem = newGroup.items[0]
    if (newItem === undefined) {
      showError('Grupo vazio, não é possível adicionar grupo vazio', {
        audience: 'system',
      })
      return
    }

    const finalGroup: ItemGroup = addItemToGroup(group(), newItem)

    setGroup(finalGroup)
  }

  // TODO: Stop using loadable for recipeSignal, use a simple signal
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
      .catch((e: unknown) => {
        setRecipeSignal({
          loading: false,
          errored: true,
          error: e instanceof Error ? e : new Error(String(e)),
        })
      })
  })

  createEffect(() => {
    const group_ = group()
    const groupHasRecipe = group_.type === 'recipe'
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

  const canApply = group().name.length > 0 && editSelection() === null

  const handleItemApply = (item: TemplateItem) => {
    const group_ = group()
    // TODO:   Allow user to edit recipe.
    // TODO:   Allow user to edit recipe inside a group.
    if (item.__type === 'RecipeItem') {
      showError(
        'Ainda não é possível editar receitas! Funcionalidade em desenvolvimento',
      )
      return
    }

    const checkOverflow = (property: keyof MacroNutrients) => {
      const macroOverflowOptions = (() => {
        const currentItem = editSelection()?.item
        if (currentItem === undefined) {
          return { enable: false }
        }
        const originalItem = persistentGroup().items.find(
          (i: Item) => i.id === currentItem.id,
        )
        if (originalItem === undefined) {
          showError('Item original não encontrado', {
            audience: 'system',
          })
          return { enable: false }
        }
        return { enable: true, originalItem }
      })()

      const currentDayDiet_ = currentDayDiet()
      const macroTarget_ = getMacroTargetForDay(stringToDate(targetDay()))

      return isOverflow(item, property, {
        currentDayDiet: currentDayDiet_,
        macroTarget: macroTarget_,
        macroOverflowOptions,
      })
    }

    const onConfirm = () => {
      console.debug(
        `[ExternalItemEditModal] onApply: setting itemId=${item.id} to item=`,
        item,
      )
      const newGroup: ItemGroup = updateItemInGroup(group_, item.id, item)

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
    const newGroup: ItemGroup = removeItemFromGroup(group(), itemId)

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
          <Show when={editSelection()?.item}>
            {(selectedItem) => (
              <ExternalItemEditModal
                visible={itemEditModalVisible}
                setVisible={setItemEditModalVisible}
                item={() => {
                  console.debug(
                    '[ExternalItemEditModal] <computed> item: ',
                    selectedItem(),
                  )
                  return selectedItem()
                }}
                targetName={(() => {
                  const receivedName = isSimpleSingleGroup(group())
                    ? props.targetMealName
                    : group().name
                  return receivedName.length > 0
                    ? receivedName
                    : 'Erro: Nome vazio'
                })()}
                targetNameColor={(() => {
                  return isSimpleSingleGroup(group())
                    ? 'text-green-500'
                    : 'text-orange-400'
                })()}
                macroOverflow={() => {
                  const originalItem = persistentGroup().items.find(
                    (i: Item) => i.id === selectedItem().id,
                  )
                  if (originalItem === undefined) {
                    showError('Item original não encontrado', {
                      audience: 'system',
                    })
                    return { enable: false }
                  }
                  return { enable: true, originalItem }
                }}
                onApply={handleItemApply}
                onDelete={handleItemDelete}
                onClose={() => setEditSelection(null)}
              />
            )}
          </Show>
          <ExternalTemplateSearchModal
            visible={templateSearchModalVisible}
            setVisible={setTemplateSearchModalVisible}
            onRefetch={props.onRefetch}
            targetName={group().name}
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
      Receita: {props.recipe?.name.toString() ?? 'Nenhuma'}
    </>
  )
}

function Body(props: {
  recipe: Accessor<Recipe | null>
  recipeEditModalVisible: Accessor<boolean>
  setRecipeEditModalVisible: Setter<boolean>
  itemEditModalVisible: Accessor<boolean>
  setItemEditModalVisible: Setter<boolean>
  templateSearchModalVisible: Accessor<boolean>
  setTemplateSearchModalVisible: Setter<boolean>
}) {
  const { show: showConfirmModal } = useConfirmModalContext()

  // Use output types for clipboard schema
  const acceptedClipboardSchema = z.union([
    itemSchema,
    itemGroupSchema,
  ]) as unknown as z.ZodType<ItemOrGroup>

  const { group, setGroup } = useItemGroupEditContext()
  const recipedGroup = createMemo(() => {
    const currentGroup = group()
    return currentGroup.type === 'recipe' ? currentGroup : null
  })

  // Use output types for strict type-safety
  type ItemOrGroup =
    | z.output<typeof itemSchema>
    | z.output<typeof itemGroupSchema>

  function isItemGroup(
    data: ItemOrGroup,
  ): data is z.output<typeof itemGroupSchema> {
    return (
      typeof data === 'object' && 'items' in data && Array.isArray(data.items)
    )
  }

  const {
    writeToClipboard,
    handlePaste: handlePasteShared,
    hasValidPastableOnClipboard: hasValidPastableOnClipboardShared,
  } = useCopyPasteActions<ItemOrGroup>({
    acceptedClipboardSchema,
    getDataToCopy: () => group() as ItemOrGroup,
    onPaste: (data) => {
      const group_ = group()
      if (isItemGroup(data)) {
        const newGroup = addItemsToGroup(
          group_,
          data.items.map((item) => regenerateId(item)),
        )
        setGroup(newGroup)
      } else {
        const newGroup = addItemToGroup(group_, regenerateId(data))
        setGroup(newGroup)
      }
    },
  })

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
                    setGroup(updateItemGroupName(group(), e.target.value))
                  }}
                  value={group().name}
                  ref={(ref) => {
                    setTimeout(() => {
                      ref.blur()
                    }, 0)
                  }}
                />
              </div>

              <div class="flex gap-2 px-2">
                <Show when={hasValidPastableOnClipboardShared()}>
                  {(_) => (
                    <div
                      class={
                        'btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105'
                      }
                      onClick={() => {
                        // TODO: Support editing complex recipes
                        if (isRecipeTooComplex(props.recipe())) {
                          showError(
                            'Os itens desse grupo não podem ser editados. Motivo: a receita é muito complexa, ainda não é possível editar receitas complexas',
                          )
                          return
                        }
                        handlePasteShared()
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
                            const newRecipe = createNewRecipe({
                              name:
                                group().name.length > 0
                                  ? group().name
                                  : 'Nova receita (a partir de um grupo)',
                              items: deepCopy(group().items) ?? [],
                              owner: currentUserId(),
                            })

                            const insertedRecipe = await insertRecipe(newRecipe)

                            if (insertedRecipe === null) {
                              return
                            }

                            setGroup(
                              setItemGroupRecipe(group(), insertedRecipe.id),
                            )

                            props.setRecipeEditModalVisible(true)
                          }

                          exec().catch((err) => {
                            showError(
                              `Falha ao criar receita a partir de grupo: ${formatError(err)}`,
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
                                    // TODO:   Create recipe for groups that don't have one
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

                                    const newGroup = setItemGroupItems(
                                      group(),
                                      recipe().items,
                                    )

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
                        {/* Direct JSX child, not a function */}
                        <>Receita não encontrada</>
                      </Show>
                    </>
                  )}
                </Show>
              </div>
            </div>
          </div>

          <ItemListView
            items={() => group().items}
            // TODO:   Check if this margin was lost.
            //   className="mt-4"
            onItemClick={(item) => {
              // TODO:   Allow user to edit recipe
              if (item.__type === 'RecipeItem') {
                showError(
                  'Ainda não é possível editar receitas! Funcionalidade em desenvolvimento',
                )
                return
              }
              // if (group?.type === 'recipe') {
              //   recipeEditModalRef.current?.showModal()
              // } else {

              // TODO: Support editing complex recipes
              if (isRecipeTooComplex(props.recipe())) {
                showError(
                  'Os itens desse grupo não podem ser editados. Motivo: a receita é muito complexa, ainda não é possível editar receitas complexas',
                )
                return
              }

              setEditSelection({ item })
              props.setItemEditModalVisible(true)
              // }
            }}
            makeHeaderFn={(item) => (
              <HeaderWithActions
                name={<ItemName />}
                primaryActions={
                  <>
                    <ItemCopyButton
                      onCopyItem={(item) => {
                        writeToClipboard(JSON.stringify(item))
                      }}
                    />
                    <ItemFavorite foodId={item.reference} />
                  </>
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
  // TODO:   Make itemGroup not nullable? Reflect changes on all group?. and itemGroup?. and ?? everywhere
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
              showConfirmModal({
                title: 'Excluir grupo',
                body: `Tem certeza que deseja excluir o grupo ${group().name}?`,
                actions: [
                  {
                    text: 'Cancelar',
                    onClick: () => undefined,
                  },
                  {
                    text: 'Excluir',
                    primary: true,
                    onClick: () => {
                      onDelete()(group().id)
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
      onPreparedQuantityChange={({
        newPreparedQuantity,
        newMultiplier,
        newRawQuantity,
      }) => {
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

        const newGroup = setItemGroupItems(props.recipedGroup(), newItems)

        props.setRecipedGroup(newGroup)
      }}
    />
  )
}

function isRecipeTooComplex(recipe: Recipe | null) {
  return recipe !== null && recipe.prepared_multiplier !== 1
}
