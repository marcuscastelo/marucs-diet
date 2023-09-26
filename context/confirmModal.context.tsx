'use client'

import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { createContext, useContext } from 'use-context-selector'

type Title = ReactNode
type Body = ReactNode

type ConfirmAction = {
  text: string
  onClick: () => void
  primary?: boolean
}

export type ConfirmModalContext = {
  internals: {
    visible: boolean
    setVisible: Dispatch<SetStateAction<boolean>>
    title: Title
    setTitle: Dispatch<SetStateAction<Title>>
    body: Body
    setBody: Dispatch<SetStateAction<Body>>
    actions: ConfirmAction[]
  }
  visible: boolean
  show: ({
    title,
    body,
    actions,
  }: Partial<
    Pick<ConfirmModalContext['internals'], 'title' | 'body' | 'actions'>
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
  actions: initialActions,
  children,
}: {
  title?: Title
  message?: Body
  visible?: boolean
  actions?: ConfirmAction[]
  children: React.ReactNode
}) {
  const [title, setTitle] = useState<Title>(initialTitle)
  const [message, setBody] = useState<Body>(initialMessage)
  const [visible, setVisible] = useState<boolean>(initiallyVisible)

  const [actions, setActions] = useState<ConfirmAction[]>(
    initialActions ?? [
      {
        text: 'Cancelar',
        onClick: () => setVisible(false),
      },
      {
        text: 'Confirmar',
        primary: true,
        onClick: () => setVisible(false),
      },
    ],
  )

  const context: ConfirmModalContext = {
    internals: {
      visible,
      setVisible,
      title,
      setTitle,
      body: message,
      setBody,
      actions,
    },
    visible,
    show: ({ title, body, actions }) => {
      if (title !== undefined) {
        setTitle(title)
      }
      if (body !== undefined) {
        setBody(body)
      }
      if (actions !== undefined) {
        setActions(
          actions.map((action) => {
            return {
              ...action,
              onClick: () => {
                setVisible(false)
                action.onClick()
              },
            }
          }),
        )
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
