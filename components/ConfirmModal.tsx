import Modal, { ModalActions } from '@/app/(modals)/Modal'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import { generateId } from '@/utils/idUtils'

export default function ConfirmModal() {
  const {
    visible,
    internals: { title, message: body, setVisible, onCancel, onConfirm },
  } = useConfirmModalContext()

  return (
    <ModalContextProvider visible={visible} onSetVisible={setVisible}>
      <Modal
        header={<Modal.Header title={title} backButton={false} />}
        body={<p>{body}</p>}
        actions={
          <ModalActions>
            <button className="btn btn-ghost" onClick={onCancel}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={onConfirm}>
              Confirmar
            </button>
          </ModalActions>
        }
      />
    </ModalContextProvider>
  )
}
