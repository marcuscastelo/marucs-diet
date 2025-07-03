/**
 * Unified Modal Container component.
 * Renders all active modals using the existing Modal component.
 */

import { For, Show } from 'solid-js'

import { Modal } from '~/sections/common/components/Modal'
import { useUnifiedModal } from '~/shared/modal/context/UnifiedModalProvider'
import type { ModalState } from '~/shared/modal/types/modalTypes'

/**
 * Renders individual modal content based on modal type.
 */
function ModalRenderer(props: { modal: ModalState }) {
  const { closeModal } = useUnifiedModal()

  const handleClose = () => {
    closeModal(props.modal.id)
  }

  return (
    <Modal visible={props.modal.isOpen} onClose={handleClose}>
      <Show when={props.modal.showCloseButton !== false}>
        <Modal.Header title={props.modal.title} onClose={handleClose} />
      </Show>
      <Show when={props.modal.showCloseButton === false}>
        <div class="flex gap-4 justify-between items-center">
          <div class="flex-1">{props.modal.title}</div>
        </div>
      </Show>

      <Modal.Content>
        <Show when={props.modal.type === 'error'}>
          <div class="error-modal">
            <div class="alert alert-error mb-4">
              <svg
                class="stroke-current shrink-0 w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {props.modal.type === 'error'
                  ? props.modal.errorDetails.message
                  : ''}
              </span>
            </div>
            <Show
              when={
                props.modal.type === 'error' && props.modal.errorDetails.stack
              }
            >
              <details class="mt-2">
                <summary class="cursor-pointer text-sm text-gray-400 hover:text-white">
                  Show technical details
                </summary>
                <pre class="mt-2 text-xs bg-gray-900 p-3 rounded border border-gray-700 overflow-auto max-h-40">
                  {props.modal.type === 'error'
                    ? props.modal.errorDetails.stack
                    : ''}
                </pre>
              </details>
            </Show>
          </div>
        </Show>

        <Show when={props.modal.type === 'content'}>
          <div class="content-modal">
            {props.modal.type === 'content'
              ? typeof props.modal.content === 'function'
                ? props.modal.content(props.modal.id)
                : props.modal.content
              : null}
          </div>
        </Show>

        <Show when={props.modal.type === 'confirmation'}>
          <div class="confirmation-modal">
            <p class="mb-6 text-gray-200">
              {props.modal.type === 'confirmation' ? props.modal.message : ''}
            </p>
          </div>
        </Show>
      </Modal.Content>

      <Show when={props.modal.type === 'content' && props.modal.footer}>
        <Modal.Footer>
          {props.modal.type === 'content'
            ? typeof props.modal.footer === 'function'
              ? props.modal.footer()
              : props.modal.footer
            : null}
        </Modal.Footer>
      </Show>

      <Show when={props.modal.type === 'confirmation'}>
        <Modal.Footer>
          <button
            type="button"
            class="btn btn-ghost"
            onClick={() => {
              if (props.modal.type === 'confirmation') {
                props.modal.onCancel?.()
              }
              handleClose()
            }}
          >
            {props.modal.type === 'confirmation'
              ? (props.modal.cancelText ?? 'Cancel')
              : 'Cancel'}
          </button>
          <button
            type="button"
            class="btn btn-primary"
            onClick={() => {
              if (props.modal.type === 'confirmation') {
                void props.modal.onConfirm?.()
              }
              handleClose()
            }}
          >
            {props.modal.type === 'confirmation'
              ? (props.modal.confirmText ?? 'Confirm')
              : 'Confirm'}
          </button>
        </Modal.Footer>
      </Show>
    </Modal>
  )
}

/**
 * Main modal container component.
 * Renders all active modals using the Modal component.
 */
export function UnifiedModalContainer() {
  const { modals } = useUnifiedModal()

  return (
    <div class="unified-modal-container">
      <For each={modals()}>
        {(modal) => (
          <Show when={modal.isOpen}>
            <ModalRenderer modal={modal} />
          </Show>
        )}
      </For>
    </div>
  )
}

/**
 * Default export for convenience.
 */
export default UnifiedModalContainer
