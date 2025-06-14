import { type Accessor, type Setter } from 'solid-js'

import { type Template } from '~/modules/diet/template/domain/template'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import EANInsertModal from '~/sections/ean/components/EANInsertModal'

export function ExternalEANInsertModal(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onSelect: (template: Template) => void
}) {
  return (
    <ModalContextProvider visible={props.visible} setVisible={props.setVisible}>
      <EANInsertModal onSelect={props.onSelect} />
    </ModalContextProvider>
  )
}
