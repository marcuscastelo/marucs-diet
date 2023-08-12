'use client'

import Modal, { ModalRef } from '@/app/(modals)/Modal'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import { BarCodeReader } from '@/app/BarCodeReader'
import Show from '@/app/Show'
import { useRef, useState } from 'react'

export default function Page() {
  const modalRef = useRef<ModalRef>(null)
  const [showing, setShowing] = useState(false)

  return (
    <>
      <span>isShowing: {showing ? 'true' : 'false'}</span>
      <br />

      <button
        className="btn"
        onClick={(e) => {
          e.preventDefault()
          modalRef.current?.showModal()
        }}
      >
        Show Modal
      </button>

      <button
        className="btn"
        onClick={(e) => {
          e.preventDefault()
          modalRef.current?.close()
        }}
      >
        Close Modal
      </button>

      <ModalContextProvider
        visible={false}
        onVisibilityChange={(...args) => {
          setShowing(...args)
        }}
      >
        <Modal
          modalId="modal-id"
          onSubmit={() => {
            alert('submit')
          }}
          ref={modalRef}
        />
      </ModalContextProvider>
    </>
  )
}
