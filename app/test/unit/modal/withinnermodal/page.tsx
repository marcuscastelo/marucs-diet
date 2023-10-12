'use client'

import Modal from '@/app/(modals)/Modal'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import { Signal, useSignal } from '@preact/signals-react'

export default function Page() {
  const showing = useSignal(false)
  const innerShowing = useSignal(false)

  return (
    <>
      <span>isShowing: {showing ? 'true' : 'false'}</span>
      <span>innerShowing: {innerShowing ? 'true' : 'false'}</span>
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
        <Modal body={<MyModal showing={innerShowing} />} />
      </ModalContextProvider>
    </>
  )
}

function MyModal({ showing }: { showing: Signal<boolean> }) {
  return (
    <>
      <span>isShowing: {showing ? 'true' : 'false'}</span>
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
