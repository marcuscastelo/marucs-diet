'use client'

import { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext } from 'use-context-selector'

type ModalContext = {
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
}

const ModalContext = createContext<ModalContext | null>(null)

export function useModalContext() {
  const context = useContext(ModalContext)

  if (!context) {
    throw new Error(
      'useMealItemContext must be used within a MealItemContextProvider',
    )
  }

  return context
}

export function ModalContextProvider({
  visible,
  setVisible,
  children,
}: {
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
  children: ReactNode
}) {
  return (
    <ModalContext.Provider value={{ visible, setVisible }}>
      {children}
    </ModalContext.Provider>
  )
}
