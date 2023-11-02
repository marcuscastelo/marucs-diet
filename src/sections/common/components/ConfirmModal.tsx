import { Modal, ModalActions, ModalHeader } from '@/sections/common/components/Modal'
import { ModalContextProvider } from '@/sections/common/context/ModalContext'
import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { For } from 'solid-js'

export function ConfirmModal () {
  const {
    internals: { visible, setVisible, title, body, actions }
  } = useConfirmModalContext()

  return (
    <ModalContextProvider visible={visible} setVisible={setVisible} >
      <Modal
        header={<ModalHeader title={title()} backButton={false} />}
        body={<p>{body()}</p>}
        actions={
          <ModalActions>
            <For each={actions()}>
            {(action) => (
              <button

                class={`btn ${
                  (action.primary === undefined || action.primary) ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={action.onClick}
              >
                {action.text}
              </button>
            )}
            </For>
          </ModalActions>
        }
      />
    </ModalContextProvider>
  )
}
