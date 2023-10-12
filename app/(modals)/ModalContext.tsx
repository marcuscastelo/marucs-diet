'use client'

import { Signal } from '@preact/signals-react'
import { ReactNode } from 'react'
import { createContext, useContext } from 'use-context-selector'

type ModalContext = {
  visible: Signal<boolean>
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
  children,
}: {
  visible: Signal<boolean>
  children: ReactNode
}) {
  return (
    <ModalContext.Provider value={{ visible }}>
      {children}
    </ModalContext.Provider>
  )
}
