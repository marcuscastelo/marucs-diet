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
    body: Body
    setBody: Dispatch<SetStateAction<Body>>
    onConfirm: () => void
    onCancel: () => void
    setOnConfirm: Dispatch<SetStateAction<() => void>>
    setOnCancel: Dispatch<SetStateAction<() => void>>
  }
  visible: boolean
  show: ({
    title,
    body,
    onConfirm,
    onCancel,
  }: {
    title?: Title
    body?: Body
    onConfirm?: () => void
    onCancel?: () => void
  }) => void
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
  body: initialBody = 'BUG: No body provided',
  visible: initiallyVisible = false,
  onConfirm: initialOnConfirm = () => undefined,
  onCancel: initialOnCancel = () => undefined,
  children,
}: {
  title?: Title
  body?: Body
  visible?: boolean
  onConfirm?: () => void
  onCancel?: () => void
  children: React.ReactNode
}) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [visible, setVisible] = useState(initiallyVisible)
  const [onConfirm, setOnConfirm] = useState<() => void>(() => initialOnConfirm)
  const [onCancel, setOnCancel] = useState<() => void>(() => initialOnCancel)

  const context: ConfirmModalContext = {
    internals: {
      visible,
      setVisible,
      title,
      setTitle,
      body,
      setBody,
      onConfirm,
      onCancel,
      setOnConfirm,
      setOnCancel,
    },
    visible,
    show: ({
      title,
      body,
      onConfirm,
      onCancel,
    }: {
      title?: Title
      body?: Body
      onConfirm?: () => void
      onCancel?: () => void
    }) => {
      if (title !== undefined) {
        setTitle(title)
      }
      if (body !== undefined) {
        setBody(body)
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
