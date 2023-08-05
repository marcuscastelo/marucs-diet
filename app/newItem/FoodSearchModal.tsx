'use client'

import { useEffect, useRef } from 'react'
import Modal, { ModalActions, ModalRef } from '../(modals)/modal'
import FoodSearch, { FoodSearchProps } from './FoodSearch'

export default function FoodSearchModal(props: FoodSearchProps) {
  const selfModalRef = useRef<ModalRef>(null)

  useEffect(() => {
    if (selfModalRef.current) {
      selfModalRef.current.showModal()
    }
  }, [])

  return (
    <Modal
      ref={selfModalRef}
      modalId="foodSearchModal"
      header={<h1>Busca de alimentos</h1>}
      body={
        <div className="max-h-full">
          <FoodSearch {...props} />
        </div>
      }
      actions={
        <ModalActions>
          <button onClick={() => selfModalRef.current?.close()}>Fechar</button>
        </ModalActions>
      }
    />
  )
}
