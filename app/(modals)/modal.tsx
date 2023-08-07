'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

export type ModalProps = {
  modalId: string
  header?: React.ReactNode
  body?: React.ReactNode
  actions?: React.ReactNode
  hasBackdrop?: boolean
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  onVisibilityChange?: (isShowing: boolean) => void
  show?: boolean
}

export type ModalRef = {
  showModal: () => void
  close: () => void
}

// eslint-disable-next-line react/display-name
const Modal = forwardRef(
  (
    {
      modalId,
      header,
      body,
      actions,
      hasBackdrop = true,
      onSubmit,
      onVisibilityChange,
      show = false,
    }: ModalProps,
    ref: React.Ref<ModalRef>,
  ) => {
    const innerRef = useRef<HTMLDialogElement>(null)
    const [, setShowing] = useState(show)

    const handleVisibilityChange = useCallback(
      (isShowing: boolean) => {
        setShowing(isShowing)
        onVisibilityChange?.(isShowing)
      },
      [onVisibilityChange],
    )

    useEffect(() => {
      if (show) {
        innerRef.current?.showModal()
        handleVisibilityChange(true)
      } else {
        innerRef.current?.close()
        handleVisibilityChange(false)
      }
    }, [show, handleVisibilityChange])

    useImperativeHandle(ref, () => ({
      showModal: () => {
        innerRef.current?.showModal()
        handleVisibilityChange(
          innerRef.current?.open ===
            /* TODO: Check if equality is a bug */ true,
        )
      },
      close: () => {
        innerRef.current?.close()
        handleVisibilityChange(
          innerRef.current?.open ===
            /* TODO: Check if equality is a bug */ true,
        )
      },
    }))

    return (
      <dialog
        id={modalId}
        className="modal modal-bottom sm:modal-middle"
        ref={innerRef}
        onClose={() => handleVisibilityChange(false)}
      >
        {/* TODO: className deveria estar no forms? */}
        <div
          className="modal-box bg-gray-800 text-white"
          // TODO: Fix onSubmit
          // method="dialog"
          // onSubmit={onSubmit}
        >
          {header}
          {body}
          {actions}
        </div>
        {hasBackdrop && (
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => onVisibilityChange?.(false)}>close</button>
          </form>
        )}
      </dialog>
    )
  },
)

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
