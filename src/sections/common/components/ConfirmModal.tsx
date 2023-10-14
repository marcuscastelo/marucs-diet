import Modal, { ModalActions } from '@/sections/common/components/Modal'
import { ModalContextProvider } from '@/src/sections/common/context/ModalContext'
import { useConfirmModalContext } from '@/context/confirmModal.context'

export default function ConfirmModal() {
  const {
    visible,
    internals: { title, body, actions },
  } = useConfirmModalContext()

  return (
    <ModalContextProvider visible={visible}>
      <Modal
        header={<Modal.Header title={title} backButton={false} />}
        body={<p>{body}</p>}
        actions={
          <ModalActions>
            {actions.map((action, idx) => (
              <button
                key={idx}
                className={`btn ${
                  action.primary ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={action.onClick}
              >
                {action.text}
              </button>
            ))}
          </ModalActions>
        }
      />
    </ModalContextProvider>
  )
}
