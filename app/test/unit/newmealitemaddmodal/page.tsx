'use client'

import { ModalRef } from '@/app/(modals)/modal'
import MealItemAddModal from '@/app/MealItemAddModal'
import { useRef } from 'react'
import { mockItem, mockMeal } from '../(mock)/mockData'

export default function Page() {
  const modalId = 'testmodal'

  const mealItemAddModalRef = useRef<ModalRef>(null)

  return (
    <>
      <button
        className="btn"
        onClick={() => mealItemAddModalRef.current?.showModal()}
      >
        Show modal
      </button>

      <MealItemAddModal
        modalId={modalId}
        show={true}
        meal={mockMeal()}
        itemData={mockItem()}
        onApply={() => alert('apply')}
      />
    </>
  )
}
