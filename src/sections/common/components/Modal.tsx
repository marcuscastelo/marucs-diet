import { createEffect, type JSXElement, mergeProps } from 'solid-js'

import { DarkToaster } from '~/sections/common/components/DarkToaster'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { cn } from '~/shared/cn'
import { generateId } from '~/shared/utils/idUtils'

export type ModalProps = {
  children: JSXElement
  hasBackdrop?: boolean
  class?: string
}

export const Modal = (_props: ModalProps) => {
  const props = mergeProps({ hasBackdrop: true, class: '' }, _props)
  const { visible, setVisible } = useModalContext()

  // Generate a unique ID for this modal instance
  const modalId = generateId()

  const handleClose = (
    e: Event & {
      currentTarget: HTMLDialogElement
      target: Element
    },
  ) => {
    console.debug('[Modal] handleClose', modalId)
    setVisible(false)
    e.stopPropagation()
  }

  const handleCancel = (
    e: Event & {
      currentTarget: HTMLDialogElement
      target: Element
    },
  ) => {
    console.debug('[Modal] handleCancel', modalId)
    // Only close this modal, not parent modals
    setVisible(false)
    e.stopPropagation()
    e.preventDefault()
  }

  const modalClass = () =>
    cn('modal modal-bottom sm:modal-middle', {
      'modal-active': visible(),
    })

  return (
    <dialog
      id={`modal-${modalId}`}
      ref={(ref) => {
        createEffect(() => {
          console.debug('[Modal] <effect> visible:', visible())
          if (visible()) {
            ref.showModal()
          } else {
            ref.close()
          }
        })
      }}
      class={modalClass()}
      onClose={handleClose}
      onCancel={handleCancel}
    >
      <DarkToaster />

      <div class={cn('modal-box bg-gray-800 text-white', props.class)}>
        {props.children}
      </div>
      {props.hasBackdrop && (
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      )}
    </dialog>
  )
}

function ModalHeader(props: { title: JSXElement }) {
  const { setVisible } = useModalContext()

  return (
    <div class="flex gap-4 justify-between items-center">
      <div class="flex-1">{props.title}</div>
      <div class="shrink">
        <button
          type="button"
          class="text-gray-400 hover:text-white focus:outline-none cursor-pointer focus:ring-2 focus:ring-white focus:ring-opacity-25 rounded-md p-1"
          onClick={() => setVisible(false)}
          aria-label="Close modal"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

function ModalContent(props: { children: JSXElement }) {
  return <div class="modal-content">{props.children}</div>
}

function ModalFooter(props: { children: JSXElement }) {
  return <div class="modal-action">{props.children}</div>
}

// Compound component pattern
Modal.Header = ModalHeader
Modal.Content = ModalContent
Modal.Footer = ModalFooter
