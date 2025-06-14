import { For } from 'solid-js'

import { Modal } from '~/sections/common/components/Modal'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'

export function ConfirmModal() {
  const {
    internals: { visible, setVisible, title, body, actions, hasBackdrop },
  } = useConfirmModalContext()

  return (
    <ModalContextProvider visible={visible} setVisible={setVisible}>
      <Modal hasBackdrop={hasBackdrop()}>
        <Modal.Header title={title()()} />
        <Modal.Content>{body()()}</Modal.Content>
        <Modal.Footer>
          <For each={actions()}>
            {(action) => (
              <button
                class={`btn cursor-pointer ${
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
