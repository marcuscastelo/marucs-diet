'use client'

import Modal from '@/app/(modals)/Modal'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import { Dispatch, SetStateAction, useState } from 'react'

export default function Page() {
  const [showing, setShowing] = useState(false)
  const [innerShowing, setInnerShowing] = useState(false)

  return (
    <>
      <span>isShowing: {showing ? 'true' : 'false'}</span>
      <span>innerShowing: {innerShowing ? 'true' : 'false'}</span>
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
        <Modal
          body={<MyModal showing={innerShowing} setShowing={setInnerShowing} />}
        />
      </ModalContextProvider>
    </>
  )
}

function MyModal({
  showing,
  setShowing,
}: {
  showing: boolean
  setShowing: Dispatch<SetStateAction<boolean>>
}) {
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
        onSetVisible={(a) => {
          setShowing(a)
        }}
      >
        <Modal />
      </ModalContextProvider>
    </>
  )
}
