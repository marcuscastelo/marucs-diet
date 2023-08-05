'use client'

import { ModalRef } from '@/app/(modals)/modal'
import { useRef } from 'react'
import { mockItem, mockMeal } from '../(mock)/mockData'
import MealItemAddModal from '@/app/(foodItem)/MealItemAddModal'

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
        meal={mockMeal()}
        itemData={mockItem()}
        onApply={() => alert('apply')}
      />
    </>
  )
}
