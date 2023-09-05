'use client'

import { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useContext } from 'use-context-selector'

type ModalContext = {
  visible: boolean
  onSetVisible: Dispatch<SetStateAction<boolean>>
}

const ModalContext = createContext<ModalContext | null>(null)

export function useModalContext() {
  const context = useContext(ModalContext)

  if (!context) {
    throw new Error(
      'useModalContext must be used within a ModalContextProvider',
    )
  }

  return context
}

export function ModalContextProvider({
  visible,
  onSetVisible,
  children,
}: {
  visible: boolean
  onSetVisible: Dispatch<SetStateAction<boolean>>
  children: ReactNode
}) {
  return (
    <ModalContext.Provider value={{ visible, onSetVisible }}>
      {children}
    </ModalContext.Provider>
  )
}
