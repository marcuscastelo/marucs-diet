'use client'

import Modal from '@/app/(modals)/Modal'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import { useSignal } from '@preact/signals-react'

export default function Page() {
  const showing = useSignal(false)

  return (
    <>
      <span>isShowing: {showing.value ? 'true' : 'false'}</span>
      <br />

      <button
        className="btn"
        onClick={(e) => {
          e.preventDefault()
          showing.value = true
        }}
      >
        Show Modal
      </button>

      <button
        className="btn"
        onClick={(e) => {
          e.preventDefault()
          showing.value = false
        }}
      >
        Close Modal
      </button>

      <ModalContextProvider visible={showing}>
        <Modal />
      </ModalContextProvider>
    </>
  )
}
