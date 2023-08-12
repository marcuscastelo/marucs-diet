'use client'

import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

type ModalContext = {
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
  onVisibilityChange?: (visible: boolean) => void
  modalRef: React.RefObject<HTMLDialogElement>
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
  visible: initialVisible,
  onVisibilityChange,
  children,
}: {
  visible: boolean
  onVisibilityChange?: (visible: boolean) => void
  children: ReactNode
}) {
  const [visible, setVisible] = useState<boolean>(initialVisible)

  const modalRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    setVisible(initialVisible)
  }, [initialVisible])

  return (
    <ModalContext.Provider
      value={{ visible, setVisible, onVisibilityChange, modalRef }}
    >
      {children}
    </ModalContext.Provider>
  )
}
