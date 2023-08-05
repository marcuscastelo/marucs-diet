'use client'

import Modal, { ModalRef } from '@/app/(modals)/modal'
import { BarCodeReader } from '@/app/BarCodeReader'
import Show from '@/app/Show'
import { useEffect, useRef, useState } from 'react'
import { set } from 'zod'

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

      <Modal
        modalId="modal-id"
        onSubmit={() => {
          alert('submit')
        }}
        ref={modalRef}
        onVisibilityChange={setShowing}
        body={<MyModal showing={innerShowing} setShowing={setInnerShowing} />}
      />
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

      <Modal
        modalId="modal-id"
        onSubmit={() => {
          alert('submit')
        }}
        ref={modalRef}
        onVisibilityChange={setShowing}
      />
    </>
  )
}
