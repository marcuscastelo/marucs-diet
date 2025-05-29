import { type Accessor, type Setter } from 'solid-js'
import BarCodeInsertModal from '~/sections/barcode/components/BarCodeInsertModal'
import { type Template } from '~/modules/diet/template/domain/template'
import {
  ModalContextProvider,
} from '~/sections/common/context/ModalContext'

export function ExternalBarCodeInsertModal(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onSelect: (template: Template) => void
}) {
  return (
    <ModalContextProvider visible={props.visible} setVisible={props.setVisible}>
      <BarCodeInsertModal onSelect={props.onSelect} />
    </ModalContextProvider>
  )
}
