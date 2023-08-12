'use client'

import { ModalRef } from '@/app/(modals)/Modal'
import { useRef } from 'react'
import { mockItem, mockMeal } from '../(mock)/mockData'
import FoodItemEditModal from '@/app/(foodItem)/FoodItemEditModal'

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

      <FoodItemEditModal
        modalId={modalId}
        targetName="Teste"
        foodItem={mockItem()}
        onApply={() => alert('apply')}
      />
    </>
  )
}
