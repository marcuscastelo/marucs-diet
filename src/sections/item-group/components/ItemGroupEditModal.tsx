import { type Accessor, createSignal, Show } from 'solid-js'

import { type Item } from '~/modules/diet/item/domain/item'
import { canApplyGroup } from '~/modules/diet/item-group/application/canApplyGroup'
import {
  handleItemApply,
  handleItemDelete,
  handleNewItemGroup,
} from '~/modules/diet/item-group/application/itemGroupEditUtils'
import { useItemGroupClipboardActions } from '~/modules/diet/item-group/application/useItemGroupClipboardActions'
import { useRecipeResource } from '~/modules/diet/item-group/application/useRecipeResource'
import { useUnlinkRecipeIfNotFound } from '~/modules/diet/item-group/application/useUnlinkRecipeIfNotFound'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { isSimpleSingleGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { Modal } from '~/sections/common/components/Modal'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import {
  ModalContextProvider,
  useModalContext,
} from '~/sections/common/context/ModalContext'
import { ExternalItemEditModal } from '~/sections/food-item/components/ExternalItemEditModal'
import { ExternalRecipeEditModal } from '~/sections/item-group/components/ExternalRecipeEditModal'
import { ItemGroupEditModalActions } from '~/sections/item-group/components/ItemGroupEditModalActions'
import { ItemGroupEditModalBody } from '~/sections/item-group/components/ItemGroupEditModalBody'
import { ItemGroupEditModalTitle } from '~/sections/item-group/components/ItemGroupEditModalTitle'
import {
  ItemGroupEditContextProvider,
  useItemGroupEditContext,
} from '~/sections/item-group/context/ItemGroupEditContext'
import { ExternalTemplateSearchModal } from '~/sections/search/components/ExternalTemplateSearchModal'

type EditSelection = { item: Item } | null
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

  const clipboard = useItemGroupClipboardActions({ group, setGroup })

  const handleNewItemGroupHandler = handleNewItemGroup({ group, setGroup })
  const handleItemApplyHandler = handleItemApply({
    group,
    persistentGroup,
    setGroup,
    setEditSelection,
    showConfirmModal,
  })
  const handleItemDeleteHandler = handleItemDelete({
    group,
    setGroup,
    setEditSelection,
  })

  const [recipeSignal, { mutate: setRecipeSignal }] = useRecipeResource(group)

  useUnlinkRecipeIfNotFound({
    group,
    recipeSignal,
    showConfirmModal,
    setGroup,
  })

  const canApply = canApplyGroup(group, editSelection)

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
              onApply={handleItemApplyHandler}
              onDelete={handleItemDeleteHandler}
              onClose={() => setEditSelection(null)}
            />
          )}
        </Show>
        <ExternalTemplateSearchModal
          visible={templateSearchModalVisible}
          setVisible={setTemplateSearchModalVisible}
          onRefetch={props.onRefetch}
          targetName={group().name}
          onNewItemGroup={handleNewItemGroupHandler}
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
                    clipboard.hasValidPastableOnClipboard
                  }
                  handlePaste={clipboard.handlePaste}
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
