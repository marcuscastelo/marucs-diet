import { type Accessor, createEffect, type Setter, Show } from 'solid-js'

import { type Item } from '~/modules/diet/item/domain/item'
import { unifiedItemToItem } from '~/modules/diet/unified-item/domain/conversionUtils'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { UnifiedItemEditModal } from '~/sections/unified-item/components/UnifiedItemEditModal'

export type ExternalItemEditModalProps = {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  item: Accessor<Item>
  targetName: string
  targetNameColor?: string
  macroOverflow?: () => {
    enable: boolean
    originalItem?: Item
  }
  onApply: (item: Item) => void
  onClose?: () => void
}

/**
 * Converts an Item to a UnifiedItem for the modal
 */
function convertItemToUnifiedItem(item: Item): UnifiedItem {
  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    reference: {
      type: 'food',
      id: item.reference,
      macros: item.macros,
    },
    __type: 'UnifiedItem',
  }
}

/**
 * Converts macro overflow context from Item to UnifiedItem
 */
function convertMacroOverflow(
  macroOverflow?: () => {
    enable: boolean
    originalItem?: Item
  },
): () => {
  enable: boolean
  originalItem?: UnifiedItem
} {
  if (!macroOverflow) {
    return () => ({ enable: false })
  }

  return () => {
    const original = macroOverflow()
    return {
      enable: original.enable,
      originalItem: original.originalItem
        ? convertItemToUnifiedItem(original.originalItem)
        : undefined,
    }
  }
}

export function ExternalItemEditModal(props: ExternalItemEditModalProps) {
  const handleCloseWithNoChanges = () => {
    props.setVisible(false)
    props.onClose?.()
  }

  createEffect(() => {
    if (!props.visible()) {
      handleCloseWithNoChanges()
    }
  })

  const handleApply = (unifiedItem: UnifiedItem) => {
    // Convert UnifiedItem back to Item for the callback
    const item = unifiedItemToItem(unifiedItem)
    props.onApply(item)
  }

  return (
    <Show when={props.visible()}>
      <ModalContextProvider
        visible={props.visible}
        setVisible={props.setVisible}
      >
        <UnifiedItemEditModal
          item={() => convertItemToUnifiedItem(props.item())}
          targetMealName={props.targetName}
          targetNameColor={props.targetNameColor}
          macroOverflow={convertMacroOverflow(props.macroOverflow)}
          onApply={handleApply}
        />
      </ModalContextProvider>
    </Show>
  )
}
