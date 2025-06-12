import {
  type Accessor,
  createContext,
  createSignal,
  type JSXElement,
  type Setter,
  useContext,
} from 'solid-js'

// TODO:   simplify types, use Accessor<Title> and Accessor<Body> where needed instead of functions in the type definitions
type Title = () => JSXElement
type Body = () => JSXElement

type ConfirmAction = {
  text: string
  onClick: () => void
  primary?: boolean
}

export type ConfirmModalContext = {
  internals: {
    visible: Accessor<boolean>
    setVisible: Setter<boolean>
    title: Accessor<Title>
    body: Accessor<Body>
    actions: Accessor<ConfirmAction[]>
    hasBackdrop: Accessor<boolean>
  }
  visible: Accessor<boolean>
  show: ({
    title,
    body,
    actions,
    hasBackdrop,
  }: {
    title?: Title | string
    body?: Body | string
    actions?: ConfirmAction[]
    hasBackdrop?: boolean
  }) => void
  close: () => void
}

const confirmModalContext = createContext<ConfirmModalContext | null>(null)

export function useConfirmModalContext() {
  const context = useContext(confirmModalContext)
  if (context === null) {
    throw new Error(
      'useConfirmModalContext must be used within a ConfirmModalProvider',
    )
  }
  return context
}

export function ConfirmModalProvider(props: { children: JSXElement }) {
  console.debug('[ConfirmModalProvider] - Rendering')

  const [title, setTitle] = createSignal<Title>(() => <></>)
  const [body, setBody] = createSignal<Body>(() => <></>)
  const [visible, setVisible] = createSignal<boolean>(false)
  const [hasBackdrop, setHasBackdrop] = createSignal<boolean>(false)

  const [actions, setActions] = createSignal<ConfirmAction[]>([
    {
      text: 'Cancelar',
      onClick: () => setVisible(false),
    },
    {
      text: 'Confirmar',
      primary: true,
      onClick: () => setVisible(false),
    },
  ])

  const context: ConfirmModalContext = {
    internals: {
      visible,
      setVisible,
      title,
      body,
      actions, // TODO:   Propagate signal
      hasBackdrop,
    },
    visible,
    show: ({
      title,
      body,
      actions: newActions,
      hasBackdrop: newHasBackdrop,
    }) => {
      if (title !== undefined) {
        if (typeof title === 'string') {
          setTitle(() => () => <>{title}</>)
        } else {
          setTitle(() => title)
        }
      }
      if (body !== undefined) {
        if (typeof body === 'string') {
          setBody(() => () => <>{body}</>)
        } else {
          setBody(() => body)
        }
      }
      if (newActions !== undefined) {
        setActions(
          newActions.map((action) => {
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
      if (newHasBackdrop !== undefined) {
        setHasBackdrop(newHasBackdrop)
      }
      setVisible(true)
    },
    close: () => {
      setVisible(false)
    },
  }

  return (
    <confirmModalContext.Provider value={context}>
      {props.children}
    </confirmModalContext.Provider>
  )
}
