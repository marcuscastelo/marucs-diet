'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { useModalContext } from '@/sections/common/context/ModalContext'
import { BackIcon } from '@/sections/common/components/BackIcon'
import { cn } from '@/legacy/utils/cn'

export type ModalProps = {
  // TODO: Unify Header, Content and Actions for each component in the entire app
  /**
   * @deprecated
   */
  header?: ReactNode
  body?: ReactNode
  // TODO: Unify Header, Content and Actions for each component in the entire app
  /**
   * @deprecated
   */
  actions?: ReactNode
  hasBackdrop?: boolean
  className?: string
}

let modalId = 1

const Modal = ({
  header,
  body,
  actions,
  hasBackdrop = true,
  className = '',
}: ModalProps) => {
  const { visible } = useModalContext()

  const modalRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (visible.value) {
      modalRef.current?.showModal()
    } else {
      modalRef.current?.close()
    }
  }, [visible.value, modalRef])

  return (
    <dialog
      id={`modal-${modalId++}`}
      className="modal modal-bottom sm:modal-middle"
      ref={modalRef}
      onClose={(e) => {
        if (visible.value) {
          visible.value = false
          e.stopPropagation()
        }
      }}
    >
      <div className={cn('modal-box bg-gray-800 text-white', className)}>
        {header}
        {body}
        {actions}
      </div>
      {hasBackdrop && (
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      )}
    </dialog>
  )
}

Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Actions = ModalActions

// TODO: ModalHeader => Modal.Header, ModalBody => Modal.Body, ModalActions => Modal.Actions

// TODO: Use Modal.Header & Modal.Body or delete them
// TODO: Unify Header, Content and Actions for each component in the entire app
/**
 * @deprecated
 */
export function ModalHeader({
  title,
  backButton = true,
}: {
  title: ReactNode
  backButton?: boolean
}) {
  const { visible } = useModalContext()

  return (
    <div className="flex gap-2">
      {backButton && (
        <button
          className="btn btn-sm btn-ghost btn-circle"
          onClick={() => (visible.value = false)}
        >
          <BackIcon />
        </button>
      )}
      <h3 className="text-lg font-bold text-white my-auto w-full">{title}</h3>
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
export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="modal-action">{children}</div>
}

export default Modal
