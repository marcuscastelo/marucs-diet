'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import { createContext, useContext } from 'use-context-selector'

type Title = string
type Body = string

export type ConfirmModalContext = {
  internals: {
    visible: boolean
    setVisible: Dispatch<SetStateAction<boolean>>
    title: Title
    setTitle: Dispatch<SetStateAction<Title>>
    message: Body
    setMessage: Dispatch<SetStateAction<Body>>
    onConfirm: () => void
    onCancel: () => void
    setOnConfirm: Dispatch<SetStateAction<() => void>>
    setOnCancel: Dispatch<SetStateAction<() => void>>
  }
  visible: boolean
  show: ({
    title,
    message,
    onConfirm,
    onCancel,
  }: Partial<
    Pick<
      ConfirmModalContext['internals'],
      'title' | 'message' | 'onConfirm' | 'onCancel'
    >
  >) => void
  close: () => void
}

const ConfirmModalContext = createContext<ConfirmModalContext | null>(null)

export function useConfirmModalContext() {
  // TODO: Implement useContextSelector

  const context = useContext(ConfirmModalContext)
  if (!context) {
    throw new Error(
      'useConfirmModalContext must be used within a ConfirmModalProvider',
    )
  }
  return context
}

export function ConfirmModalProvider({
  title: initialTitle = 'BUG: No title provided',
  message: initialMessage = 'BUG: No body provided',
  visible: initiallyVisible = false,
  onConfirm: initialOnConfirm = () => undefined,
  onCancel: initialOnCancel = () => undefined,
  children,
}: {
  title?: Title
  message?: Body
  visible?: boolean
  onConfirm?: () => void
  onCancel?: () => void
  children: React.ReactNode
}) {
  const [title, setTitle] = useState(initialTitle)
  const [message, setMessage] = useState(initialMessage)
  const [visible, setVisible] = useState(initiallyVisible)
  const [onConfirm, setOnConfirm] = useState<() => void>(() => () => {
    setVisible(false)
    initialOnConfirm()
  })
  const [onCancel, setOnCancel] = useState<() => void>(() => () => {
    setVisible(false)
    initialOnCancel()
  })

  const context: ConfirmModalContext = {
    internals: {
      visible,
      setVisible,
      title,
      setTitle,
      message,
      setMessage,
      onConfirm,
      onCancel,
      setOnConfirm,
      setOnCancel,
    },
    visible,
    show: ({ title, message, onConfirm, onCancel }) => {
      if (title !== undefined) {
        setTitle(title)
      }
      if (message !== undefined) {
        setMessage(message)
      }
      if (onConfirm !== undefined) {
        setOnConfirm(() => () => {
          setVisible(false)
          onConfirm()
        })
      }
      if (onCancel !== undefined) {
        setOnCancel(() => () => {
          setVisible(false)
          onCancel()
        })
      }
      setVisible(true)
    },
    close: () => {
      setVisible(false)
    },
  }

  return (
    <ConfirmModalContext.Provider value={context}>
      {children}
    </ConfirmModalContext.Provider>
  )
}
