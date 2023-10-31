import { type JSXElement, type Accessor, createContext, useContext, createSignal, type Setter } from 'solid-js'

type Title = JSXElement
type Body = JSXElement

interface ConfirmAction {
  text: string
  onClick: () => void
  primary?: boolean
}

export interface ConfirmModalContext {
  internals: {
    visible: Accessor<boolean>
    setVisible: Setter<boolean>
    title: Accessor<Title>
    body: Accessor<Body>
    actions: Accessor<ConfirmAction[]>
  }
  visible: Accessor<boolean>
  show: ({
    title,
    body,
    actions
  }: {
    title?: Title
    body?: Body
    actions?: ConfirmAction[]
  }) => void
  close: () => void
}

const confirmModalContext = createContext<ConfirmModalContext | null>(null)

export function useConfirmModalContext () {
  // TODO: Implement useContextSelector

  const context = useContext(confirmModalContext)
  if (context === null) {
    throw new Error(
      'useConfirmModalContext must be used within a ConfirmModalProvider'
    )
  }
  return context
}

export function ConfirmModalProvider (props: {
  children: JSXElement
}) {
  console.debug('[ConfirmModalProvider] - Rendering')

  const [title, setTitle] = createSignal<Title>('')
  const [body, setBody] = createSignal<Body>('')
  const [visible, setVisible] = createSignal<boolean>(false)

  const [actions, setActions] = createSignal<ConfirmAction[]>([
    {
      text: 'Cancelar',
      onClick: () => (setVisible(false))
    },
    {
      text: 'Confirmar',
      primary: true,
      onClick: () => (setVisible(false))
    }
  ]
  )

  const context: ConfirmModalContext = {
    internals: {
      visible,
      setVisible,
      title,
      body,
      actions // TODO: Propagate signal
    },
    visible,
    show: ({ title, body, actions: newActions }) => {
      if (title !== undefined) {
        setTitle(title)
      }
      if (body !== undefined) {
        setBody(body)
      }
      if (newActions !== undefined) {
        setActions(newActions.map((action) => {
          return {
            ...action,
            onClick: () => {
              setVisible(false)
              action.onClick()
            }
          }
        }))
      }
      setVisible(true)
    },
    close: () => {
      setVisible(false)
    }
  }

  return (
    <confirmModalContext.Provider value={context}>
      {props.children}
    </confirmModalContext.Provider>
  )
}
