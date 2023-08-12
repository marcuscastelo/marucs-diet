'use client'

import { ModalRef } from '@/app/(modals)/Modal'
import { useRef } from 'react'
import { mockItem, mockMeal } from '../(mock)/mockData'
import FoodItemEditModal from '@/app/(foodItem)/FoodItemEditModal'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'

export default function Page() {
  const modalId = 'testmodal'

  const foodItemEditModalRef = useRef<ModalRef>(null)

  return (
    <>
      <button
        className="btn"
        onClick={() => foodItemEditModalRef.current?.showModal()}
      >
        Show modal
      </button>

      <ModalContextProvider visible={false}>
        <FoodItemEditModal
          modalId={modalId}
          targetName="Teste"
          foodItem={mockItem()}
          onApply={() => alert('apply')}
        />
      </ModalContextProvider>
    </>
  )
}
