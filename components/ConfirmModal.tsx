import Modal, { ModalActions } from '@/app/(modals)/Modal'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import { useConfirmModalContext } from '@/context/confirmModal.context'

export default function ConfirmModal() {
  const {
    visible,
    internals: { title, message: body, setVisible, onCancel, onConfirm },
  } = useConfirmModalContext()

  return (
    <ModalContextProvider visible={visible} setVisible={setVisible}>
      {/* TODO: Move modal-id to ModalContextProvider with a pseudo-random ID generation */}
      <Modal
        modalId={`confirm-modal-${Math.random()}`}
        header={<h1>{title}</h1>}
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