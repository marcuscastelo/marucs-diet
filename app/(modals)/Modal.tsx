'use client'

import React, { ReactNode, useEffect, useRef } from 'react'
import { useModalContext } from './ModalContext'
import { BackIcon } from '@/components/BackIcon'

export type ModalProps = {
  header?: React.ReactNode
  body?: React.ReactNode
  actions?: React.ReactNode
  hasBackdrop?: boolean
}

let modalId = 1

const Modal = ({ header, body, actions, hasBackdrop = true }: ModalProps) => {
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

Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Actions = ModalActions

// TODO: ModalHeader => Modal.Header, ModalBody => Modal.Body, ModalActions => Modal.Actions

// TODO: Use Modal.Header & Modal.Body or delete them
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

export function ModalBody() {
  return <>Modal body</>
}

export function ModalActions({ children }: { children: React.ReactNode }) {
  return <div className="modal-action">{children}</div>
}

export default Modal
