'use client'

import Modal, { ModalRef } from '@/app/(modals)/modal'
import { BarCodeReader } from '@/app/BarCodeReader'
import Show from '@/app/Show'
import { useRef, useState } from 'react'

export default function Page() {
  const modalRef = useRef<ModalRef>(null)
  const [showing, setShowing] = useState(false)

  return (
    <>
      <Show when={showing}>
        <div className="mx-auto w-1/2">
          <BarCodeReader id="asd" onScanned={() => undefined} />
        </div>
      </Show>
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
