'use client'

import { useState } from 'react'
import { mockItem } from '../(mock)/mockData'
import FoodItemEditModal from '@/app/(foodItem)/FoodItemEditModal'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'

export default function Page() {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <button className="btn" onClick={() => setVisible((v) => !v)}>
        Toggle modal
      </button>

      <ModalContextProvider visible={visible} onSetVisible={setVisible}>
        <FoodItemEditModal
          targetName="Teste"
          foodItem={mockItem()}
          onApply={() => alert('apply')}
        />
      </ModalContextProvider>
    </>
  )
}
