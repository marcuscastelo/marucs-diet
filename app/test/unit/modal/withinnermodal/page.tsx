'use client'

import Modal, { ModalRef } from '@/app/(modals)/Modal'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import { useEffect, useRef, useState } from 'react'

export default function Page() {
  const modalRef = useRef<ModalRef>(null)
  const [showing, setShowing] = useState(false)
  const [innerShowing, setInnerShowing] = useState(false)

  useEffect(() => {
    showing ? modalRef.current?.showModal() : modalRef.current?.close()
  }, [showing])

  return (
    <>
      <span>isShowing: {showing ? 'true' : 'false'}</span>
      <span>innerShowing: {innerShowing ? 'true' : 'false'}</span>
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
  setShowing: (showing: boolean) => void
}) {
  const modalRef = useRef<ModalRef>(null)

  useEffect(() => {
    showing ? modalRef.current?.showModal() : modalRef.current?.close()
  }, [showing])

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
