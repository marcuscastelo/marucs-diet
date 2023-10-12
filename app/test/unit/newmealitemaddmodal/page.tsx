'use client'

import { mockItem } from '../(mock)/mockData'
import FoodItemEditModal from '@/app/(foodItem)/FoodItemEditModal'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import { useSignal } from '@preact/signals-react'

export default function Page() {
  const visible = useSignal(false)

  return (
    <>
      <button className="btn" onClick={() => (visible.value = !visible.value)}>
        Toggle modal
      </button>

      <ModalContextProvider visible={visible}>
        <FoodItemEditModal
          targetName="Teste"
          foodItem={mockItem()}
          onApply={() => alert('apply')} // TODO: Change all alerts with ConfirmModal
        />
      </ModalContextProvider>
    </>
  )
}
