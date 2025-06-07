import { z } from 'zod'
import {
  type ItemGroup,
  type RecipedItemGroup,
  isRecipedItemGroup,
  isSimpleItemGroup,
  isSimpleSingleGroup,
  itemGroupSchema,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Item, itemSchema } from '~/modules/diet/item/domain/item'
import {
  type Recipe,
  createNewRecipe,
} from '~/modules/diet/recipe/domain/recipe'
import {
  type TemplateItem,
  isTemplateItemRecipe,
} from '~/modules/diet/template-item/domain/templateItem'
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
import { createResource } from 'solid-js'

import {
  type Accessor,
  type Setter,
  Show,
  createEffect,
  createSignal,
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

// Type alias para clipboard e schema
/**
 * Represents either a single Item or an ItemGroup, for clipboard and schema operations.
 * @typedef {object} ItemOrGroup
 */
type ItemOrGroup = z.infer<typeof itemSchema> | z.infer<typeof itemGroupSchema>

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
  mode?: 'edit' | 'read-only' | 'summary'
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

  // Definição do schema aceito para clipboard
  const acceptedClipboardSchema = z.union([
    itemSchema,
    itemGroupSchema,
  ]) as z.ZodType<ItemOrGroup>

  // Clipboard actions for group-level (header) actions
  const {
    handlePaste: handlePasteShared,
    hasValidPastableOnClipboard: hasValidPastableOnClipboardShared,
  } = useCopyPasteActions<ItemOrGroup>({
    acceptedClipboardSchema,
    getDataToCopy: () => group() as ItemOrGroup,
    onPaste: (data) => {
      if (isClipboardItemGroup(data)) {
        // Only add items that are valid Items
        const validItems = data.items.filter(isClipboardItem).map(regenerateId)
        setGroup(addItemsToGroup(group(), validItems))
      } else if (isClipboardItem(data)) {
        setGroup(addItemToGroup(group(), regenerateId(data)))
      } else {
        showError('Clipboard data is not a valid item or group')
      }
    },
  })

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

  const [recipeSignal, { mutate: setRecipeSignal }] = createResource(
    async () => {
      const group_ = group()
      if (!isRecipedItemGroup(group_)) {
        return null
      }
      try {
        return await fetchRecipeById(group_.recipe)
      } catch {
        return null
      }
    },
  )

  createEffect(() => {
    const group_ = group()
    const groupHasRecipe = isRecipedItemGroup(group_)
    console.debug('Group changed:', group())

    if (groupHasRecipe) {
      setTimeout(() => {
        if (recipeSignal.state === 'ready' && recipeSignal() === null) {
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
    if (isTemplateItemRecipe(item)) {
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
    <Show when={recipeSignal.state === 'ready'} keyed>
      <>
        <ExternalRecipeEditModal
          recipe={recipeSignal() ?? null}
          setRecipe={setRecipeSignal}
          visible={recipeEditModalVisible}
          setVisible={setRecipeEditModalVisible}
          onRefetch={props.onRefetch}
        />
        <Show when={editSelection()?.item}>
          {(selectedItem) => (
            <ExternalItemEditModal
              visible={itemEditModalVisible}
              setVisible={setItemEditModalVisible}
              item={() => selectedItem()}
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
                const currentItem = editSelection()?.item
                if (!currentItem) return { enable: false }
                const originalItem = persistentGroup().items.find(
                  (i: Item) => i.id === currentItem.id,
                )
                if (!originalItem) return { enable: false }
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
                  recipe={recipeSignal() ?? null}
                  targetMealName={props.targetMealName}
                  group={group}
                  setGroup={setGroup}
                  mode={props.mode}
                  hasValidPastableOnClipboard={
                    hasValidPastableOnClipboardShared
                  }
                  handlePaste={handlePasteShared}
                  setRecipeEditModalVisible={setRecipeEditModalVisible}
                  showConfirmModal={showConfirmModal}
                />
              }
            />
            <Modal.Content>
              <Body
                recipe={() => recipeSignal() ?? null}
                itemEditModalVisible={itemEditModalVisible}
                setItemEditModalVisible={setItemEditModalVisible}
                templateSearchModalVisible={templateSearchModalVisible}
                setTemplateSearchModalVisible={setTemplateSearchModalVisible}
                recipeEditModalVisible={recipeEditModalVisible}
                setRecipeEditModalVisible={setRecipeEditModalVisible}
                mode={props.mode}
                writeToClipboard={(text: string) => {
                  void navigator.clipboard.writeText(text)
                }}
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
    </Show>
  )
}

function GroupNameEdit(props: {
  group: Accessor<ItemGroup>
  setGroup: Setter<ItemGroup>
  mode?: 'edit' | 'read-only' | 'summary'
}) {
  const [isEditingName, setIsEditingName] = createSignal(false)
  return (
    <Show
      when={isEditingName() && props.mode === 'edit'}
      fallback={
        <div class="flex items-center gap-1 min-w-0">
          <span
            class="truncate text-lg font-semibold text-white"
            title={props.group().name}
          >
            {props.group().name}
          </span>
          {props.mode === 'edit' && (
            <button
              class="btn btn-xs btn-ghost px-1"
              aria-label="Editar nome do grupo"
              onClick={() => setIsEditingName(true)}
              style={{ 'line-height': '1' }}
            >
              ✏️
            </button>
          )}
        </div>
      }
    >
      <form
        class="flex items-center gap-1 min-w-0 w-full"
        onSubmit={(e) => {
          e.preventDefault()
          setIsEditingName(false)
        }}
      >
        <input
          class="input input-xs w-full max-w-[180px]"
          type="text"
          value={props.group().name}
          onChange={(e) =>
            props.setGroup(updateItemGroupName(props.group(), e.target.value))
          }
          onBlur={() => setIsEditingName(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setIsEditingName(false)
          }}
          ref={(ref: HTMLInputElement) => {
            setTimeout(() => {
              ref.focus()
              ref.select()
            }, 0)
          }}
          disabled={props.mode !== 'edit'}
          style={{
            'padding-top': '2px',
            'padding-bottom': '2px',
            'font-size': '1rem',
          }}
        />
        <button
          class="btn btn-xs btn-primary px-2"
          aria-label="Salvar nome do grupo"
          onClick={() => setIsEditingName(false)}
          type="submit"
          style={{ 'min-width': '48px', height: '28px' }}
        >
          Salvar
        </button>
      </form>
    </Show>
  )
}

function GroupHeaderActions(props: {
  group: Accessor<ItemGroup>
  setGroup: Setter<ItemGroup>
  mode?: 'edit' | 'read-only' | 'summary'
  recipe: Recipe | null
  hasValidPastableOnClipboard: () => boolean
  handlePaste: () => void
  setRecipeEditModalVisible: Setter<boolean>
  showConfirmModal: ConfirmModalContext['show']
}) {
  return (
    <Show when={props.mode === 'edit'}>
      <div class="flex gap-2 ml-4">
        <Show when={props.hasValidPastableOnClipboard()}>
          <button
            class="btn-ghost btn px-2 text-white hover:scale-105"
            onClick={() => {
              if (isRecipeTooComplex(props.recipe)) {
                showError(
                  'Os itens desse grupo não podem ser editados. Motivo: a receita é muito complexa, ainda não é possível editar receitas complexas',
                )
                return
              }
              props.handlePaste()
            }}
          >
            <PasteIcon />
          </button>
        </Show>
        <Show when={isSimpleItemGroup(props.group())}>
          <button
            class="my-auto"
            onClick={() => {
              const exec = async () => {
                const newRecipe = createNewRecipe({
                  name:
                    props.group().name.length > 0
                      ? props.group().name
                      : 'Nova receita (a partir de um grupo)',
                  items: deepCopy(props.group().items) ?? [],
                  owner: currentUserId(),
                })
                const insertedRecipe = await insertRecipe(newRecipe)
                if (insertedRecipe === null) return
                props.setGroup(
                  setItemGroupRecipe(props.group(), insertedRecipe.id),
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
        </Show>
        <Show
          when={(() => {
            const group_ = props.group()
            return isRecipedItemGroup(group_) && group_
          })()}
        >
          {(group) => (
            <>
              <Show when={props.recipe}>
                {(recipe) => (
                  <>
                    <Show when={isRecipedGroupUpToDate(group(), recipe())}>
                      <button
                        class="my-auto"
                        onClick={() => {
                          props.setRecipeEditModalVisible(true)
                        }}
                      >
                        <RecipeIcon />
                      </button>
                    </Show>
                    <Show when={!isRecipedGroupUpToDate(group(), recipe())}>
                      <button
                        class="my-auto hover:animate-pulse"
                        onClick={() => {
                          if (!props.recipe) return
                          const newGroup = setItemGroupItems(
                            group(),
                            props.recipe.items,
                          )
                          props.setGroup(newGroup)
                        }}
                      >
                        <DownloadIcon />
                      </button>
                    </Show>
                    <button
                      class="my-auto hover:animate-pulse"
                      onClick={() => {
                        askUnlinkRecipe('Deseja desvincular a receita?', {
                          showConfirmModal: props.showConfirmModal,
                          group: () => group(),
                          setGroup: props.setGroup,
                        })
                      }}
                    >
                      <BrokenLink />
                    </button>
                  </>
                )}
              </Show>
              <Show when={!props.recipe}>
                <>Receita não encontrada</>
              </Show>
            </>
          )}
        </Show>
      </div>
    </Show>
  )
}

function Title(props: {
  targetMealName: string
  recipe: Recipe | null
  mode?: 'edit' | 'read-only' | 'summary'
  group: Accessor<ItemGroup>
  setGroup: Setter<ItemGroup>
  hasValidPastableOnClipboard: () => boolean
  handlePaste: () => void
  setRecipeEditModalVisible: Setter<boolean>
  showConfirmModal: ConfirmModalContext['show']
}) {
  return (
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between gap-2">
        <span class="text-lg font-bold text-white">Grupo:</span>
        <GroupNameEdit
          group={props.group}
          setGroup={props.setGroup}
          mode={props.mode}
        />
        <GroupHeaderActions
          group={props.group}
          setGroup={props.setGroup}
          mode={props.mode}
          recipe={props.recipe}
          hasValidPastableOnClipboard={props.hasValidPastableOnClipboard}
          handlePaste={props.handlePaste}
          setRecipeEditModalVisible={props.setRecipeEditModalVisible}
          showConfirmModal={props.showConfirmModal}
        />
      </div>
      <div class="text-sm text-gray-400 mt-1">
        Em <span class="text-green-500">"{props.targetMealName}"</span>
      </div>
      <div class="text-xs text-gray-400">
        Receita: {props.recipe?.name.toString() ?? 'Nenhuma'}
      </div>
    </div>
  )
}

// Actions: garantir acesso ao contexto
function Actions(props: {
  onDelete?: (groupId: number) => void
  onCancel?: () => void
  canApply: boolean
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
}) {
  // Corrigido: importa do contexto
  const { group, saveGroup } = useItemGroupEditContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <>
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

// Body: garantir acesso ao contexto
function Body(props: {
  recipe: Accessor<Recipe | null>
  recipeEditModalVisible: Accessor<boolean>
  setRecipeEditModalVisible: Setter<boolean>
  itemEditModalVisible: Accessor<boolean>
  setItemEditModalVisible: Setter<boolean>
  templateSearchModalVisible: Accessor<boolean>
  setTemplateSearchModalVisible: Setter<boolean>
  mode?: 'edit' | 'read-only' | 'summary'
  writeToClipboard: (text: string) => void
}) {
  const { group } = useItemGroupEditContext()
  return (
    <Show when={group()}>
      {(group) => (
        <>
          <div class="text-md mt-4">
            <div class="flex gap-4">
              <div class="my-auto flex-1" />
            </div>
          </div>
          <ItemListView
            items={() => group().items}
            onItemClick={
              props.mode === 'edit'
                ? (item) => {
                    if (isTemplateItemRecipe(item)) {
                      // TODO:   Allow user to edit recipe
                      showError(
                        'Ainda não é possível editar receitas! Funcionalidade em desenvolvimento',
                      )
                      return
                    }
                    if (isRecipeTooComplex(props.recipe())) {
                      // TODO: Support editing complex recipes
                      showError(
                        'Os itens desse grupo não podem ser editados. Motivo: a receita é muito complexa, ainda não é possível editar receitas complexas',
                      )
                      return
                    }
                    setEditSelection({ item })
                    props.setItemEditModalVisible(true)
                  }
                : undefined
            }
            mode={props.mode}
            makeHeaderFn={(item) => (
              <HeaderWithActions
                name={<ItemName />}
                primaryActions={
                  props.mode === 'edit' ? (
                    <>
                      <ItemCopyButton
                        onCopyItem={(item) => {
                          props.writeToClipboard(JSON.stringify(item))
                        }}
                      />
                      <ItemFavorite foodId={item.reference} />
                    </>
                  ) : null
                }
              />
            )}
          />
          {props.mode === 'edit' && (
            <button
              class="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              onClick={() => {
                props.setTemplateSearchModalVisible(true)
              }}
            >
              Adicionar item
            </button>
          )}
        </>
      )}
    </Show>
  )
}

function isRecipeTooComplex(recipe: Recipe | null) {
  return recipe !== null && recipe.prepared_multiplier !== 1
}

// Add type guards at the top after type ItemOrGroup
function isClipboardItem(data: unknown): data is z.infer<typeof itemSchema> {
  return (
    typeof data === 'object' &&
    data !== null &&
    '__type' in data &&
    (data as { __type?: string }).__type === 'Item' &&
    'id' in data &&
    'name' in data &&
    'reference' in data &&
    'quantity' in data &&
    'macros' in data
  )
}
function isClipboardItemGroup(
  data: unknown,
): data is z.infer<typeof itemGroupSchema> {
  return (
    typeof data === 'object' &&
    data !== null &&
    '__type' in data &&
    (data as { __type?: string }).__type === 'ItemGroup' &&
    'items' in data &&
    Array.isArray((data as { items?: unknown[] }).items)
  )
}
