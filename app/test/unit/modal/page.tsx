'use client'

import Modal from '@/app/(modals)/Modal'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import { useState } from 'react'

export default function Page() {
  const [showing, setShowing] = useState(false)

  return (
    <>
      <span>isShowing: {showing ? 'true' : 'false'}</span>
      <br />

      <button
        className="btn"
        onClick={(e) => {
          e.preventDefault()
          setShowing(true)
        }}
      >
        Show Modal
      </button>

      <button
        className="btn"
        onClick={(e) => {
          e.preventDefault()
          setShowing(false)
        }}
      >
        Close Modal
      </button>

      <ModalContextProvider
        visible={false}
        onSetVisible={(...args) => {
          setShowing(...args)
        }}
      >
        <Modal />
      </ModalContextProvider>
    </>
  )
}
