import { useModalContext } from '~/sections/common/context/ModalContext'
import { BackIcon } from '~/sections/common/components/BackIcon'
import { cn } from '~/legacy/utils/cn'
import { mergeProps, type JSXElement, createEffect } from 'solid-js'

export type ModalProps = {
  // TODO: Unify Header, Content and Actions for each component in the entire app
  /**
   * @deprecated
   */
  header?: JSXElement
  body?: JSXElement
  // TODO: Unify Header, Content and Actions for each component in the entire app
  /**
   * @deprecated
   */
  actions?: JSXElement
  hasBackdrop?: boolean
  class?: string
}

let modalId = 1

export const Modal = (_props: ModalProps) => {
  const props = mergeProps({ hasBackdrop: true, className: '' }, _props)
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
        if (ref !== null) {
          createEffect(() => {
            console.debug('[Modal] <effect> visible:', visible())
            if (visible()) {
              ref.showModal()
            } else {
              ref.close()
            }
          })
        }
      }}
      class={modalClass()}
      onClose={handleClose}
      onCancel={handleClose}
    >
      <div class={cn('modal-box bg-gray-800 text-white', props.class)}>
        {props.header}
        {props.body}
        {props.actions}
      </div>
      {props.hasBackdrop && (
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      )}
    </dialog>
  )
}

// TODO: Use Modal.Header & Modal.Body or delete them
// TODO: Unify Header, Content and Actions for each component in the entire app
/**
 * @deprecated
 */
export function ModalHeader(_props: {
  title: JSXElement
  backButton?: boolean
}) {
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
// TODO: Unify Header, Content and Actions for each component in the entire app
/**
 * @deprecated
 */
export function ModalBody() {
  return <>Modal body</>
}
// TODO: Unify Header, Content and Actions for each component in the entire app
/**
 * @deprecated
 */
export function ModalActions(props: { children: JSXElement }) {
  return <div class="modal-action">{props.children}</div>
}
