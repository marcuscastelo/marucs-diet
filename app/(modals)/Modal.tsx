'use client'

import { useEffect, useRef } from 'react'
import { useModalContext } from './ModalContext'

export type ModalProps = {
  modalId: string
  header?: React.ReactNode
  body?: React.ReactNode
  actions?: React.ReactNode
  hasBackdrop?: boolean
}

const Modal = ({
  modalId,
  header,
  body,
  actions,
  hasBackdrop = true,
}: ModalProps) => {
  const { visible, setVisible } = useModalContext()

  const modalRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (visible) {
      modalRef.current?.showModal()
    } else {
      modalRef.current?.close()
    }
  }, [visible, modalRef])

  return (
    <dialog
      id={modalId}
      className="modal modal-bottom sm:modal-middle"
      ref={modalRef}
      onClose={() => visible && setVisible(false)}
    >
      <div className="modal-box bg-gray-800 text-white">
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

// TODO: ModalHeader => Modal.Header, ModalBody => Modal.Body, ModalActions => Modal.Actions

// TODO: Use Modal.Header & Modal.Body or delete them
export function ModalHeader() {
  return <h3 className="text-lg font-bold text-white">Modal header</h3>
}

export function ModalBody() {
  return <>Modal body</>
}

export function ModalActions({ children }: { children: React.ReactNode }) {
  return <div className="modal-action">{children}</div>
}

export default Modal
