import { createResource } from 'solid-js'
import { type Accessor, createEffect, createSignal, Show } from 'solid-js'
import { z } from 'zod'

import { regenerateId } from '~/legacy/utils/idUtils'
import { isOverflow } from '~/legacy/utils/macroOverflow'
import {
  currentDayDiet,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { type Item, itemSchema } from '~/modules/diet/item/domain/item'
import {
  isRecipedItemGroup,
  type ItemGroup,
  itemGroupSchema,
} from '~/modules/diet/item-group/domain/itemGroup'
import { isSimpleSingleGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  addItemsToGroup,
  addItemToGroup,
  removeItemFromGroup,
  updateItemInGroup,
} from '~/modules/diet/item-group/domain/itemGroupOperations'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import { fetchRecipeById } from '~/modules/diet/recipe/application/recipe'
import {
  isTemplateItemRecipe,
  type TemplateItem,
} from '~/modules/diet/template-item/domain/templateItem'
import { showError } from '~/modules/toast/application/toastManager'
import { Modal } from '~/sections/common/components/Modal'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import {
  ModalContextProvider,
  useModalContext,
} from '~/sections/common/context/ModalContext'
import { useCopyPasteActions } from '~/sections/common/hooks/useCopyPasteActions'
import { ExternalItemEditModal } from '~/sections/food-item/components/ExternalItemEditModal'
import { ExternalRecipeEditModal } from '~/sections/item-group/components/ExternalRecipeEditModal'
import { ItemGroupEditModalActions } from '~/sections/item-group/components/ItemGroupEditModalActions'
import { ItemGroupEditModalBody } from '~/sections/item-group/components/ItemGroupEditModalBody'
import { ItemGroupEditModalTitle } from '~/sections/item-group/components/ItemGroupEditModalTitle'
import { askUnlinkRecipe } from '~/sections/item-group/components/itemGroupModals'
import {
  ItemGroupEditContextProvider,
  useItemGroupEditContext,
} from '~/sections/item-group/context/ItemGroupEditContext'
import { ExternalTemplateSearchModal } from '~/sections/search/components/ExternalTemplateSearchModal'
import { stringToDate } from '~/shared/utils/date'

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

const InnerItemGroupEditModal = (props: ItemGroupEditModalProps) => {
  const { visible, setVisible } = useModalContext()
  const { group, persistentGroup, setGroup } = useItemGroupEditContext()
  const { show: showConfirmModal } = useConfirmModalContext()
  const [recipeEditModalVisible, setRecipeEditModalVisible] =
    createSignal(false)
  const [itemEditModalVisible, setItemEditModalVisible] = createSignal(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    createSignal(false)

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
                <ItemGroupEditModalTitle
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
              <ItemGroupEditModalBody
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
                setEditSelection={setEditSelection}
              />
            </Modal.Content>
            <Modal.Footer>
              <ItemGroupEditModalActions
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
