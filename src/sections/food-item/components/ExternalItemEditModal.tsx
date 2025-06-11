import { type Accessor, createEffect, type Setter, Show } from 'solid-js'

import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import {
  ItemEditModal,
  ItemEditModalProps,
} from '~/sections/food-item/components/ItemEditModal'

export type ExternalItemEditModalProps = {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onClose?: () => void
} & ItemEditModalProps

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
          macroOverflow={props.macroOverflow}
          onApply={props.onApply}
          onDelete={props.onDelete}
        />
      </ModalContextProvider>
    </Show>
  )
}
