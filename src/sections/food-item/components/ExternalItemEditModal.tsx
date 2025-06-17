import { type Accessor, createEffect, type Setter, Show } from 'solid-js'

import { type Item } from '~/modules/diet/item/domain/item'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { ItemEditModal } from '~/sections/food-item/components/ItemEditModal'

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
  onApply: (item: TemplateItem) => void
  onClose?: () => void
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

  return (
    <Show when={props.visible()}>
      <ModalContextProvider
        visible={props.visible}
        setVisible={props.setVisible}
      >
        <ItemEditModal
          item={props.item}
          targetName={props.targetName}
          targetNameColor={props.targetNameColor}
          macroOverflow={props.macroOverflow ?? (() => ({ enable: false }))}
          onApply={props.onApply}
        />
      </ModalContextProvider>
    </Show>
  )
}
