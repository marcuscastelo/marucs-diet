import { createEffect, mergeProps, type JSXElement } from 'solid-js'
import { BackIcon } from '~/sections/common/components/icons/BackIcon'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { cn } from '~/shared/cn'
import { DarkToaster } from './DarkToaster'

export type ModalProps = {
  children: JSXElement
  hasBackdrop?: boolean
  class?: string
}

let modalId = 1

export const Modal = (_props: ModalProps) => {
  const props = mergeProps({ hasBackdrop: true, class: '' }, _props)
  const { visible, setVisible } = useModalContext()

  const handleClose = (
    e: Event & {
      currentTarget: HTMLDialogElement
      target: Element
    },
  ) => {
    console.debug('[Modal] handleClose')
    setVisible(false)
    e.stopPropagation()
  }

  const modalClass = () =>
    cn('modal modal-bottom sm:modal-middle', {
      'modal-active': visible(),
    })

  return (
    <dialog
      id={`modal-${modalId++}`}
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
      onCancel={handleClose}
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

function ModalHeader(_props: { title: JSXElement; backButton?: boolean }) {
  const props = mergeProps({ backButton: true }, _props)
  const { setVisible } = useModalContext()

  return (
    <div class="flex gap-2">
      {props.backButton && (
        <button
          class="btn btn-sm btn-ghost btn-circle"
          onClick={() => {
            setVisible(false)
          }}
        >
          <BackIcon />
        </button>
      )}
      <h3 class="text-lg font-bold text-white my-auto w-full">{props.title}</h3>
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
