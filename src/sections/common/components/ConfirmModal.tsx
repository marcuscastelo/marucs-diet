import { Modal } from '~/sections/common/components/Modal'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { For } from 'solid-js'

export function ConfirmModal() {
  const {
    internals: { visible, setVisible, title, body, actions, hasBackdrop },
  } = useConfirmModalContext()

  return (
    <ModalContextProvider visible={visible} setVisible={setVisible}>
      <Modal hasBackdrop={hasBackdrop()}>
        <Modal.Header title={title()()} backButton={false} />
        <Modal.Content>{body()()}</Modal.Content>
        <Modal.Footer>
          <For each={actions()}>
            {(action) => (
              <button
                class={`btn ${
                  action.primary !== undefined && action.primary
                    ? 'btn-primary'
                    : 'btn-ghost'
                }`}
                onClick={action.onClick}
              >
                {action.text}
              </button>
            )}
          </For>
        </Modal.Footer>
      </Modal>
    </ModalContextProvider>
  )
}
