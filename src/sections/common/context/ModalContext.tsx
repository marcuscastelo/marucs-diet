import { type JSXElement, createContext, useContext, createSignal, createEffect, type Accessor, type Setter } from 'solid-js'

interface ModalContext {
  visible: Accessor<boolean>
  setVisible: (value: boolean) => void
}

const modalContext = createContext<ModalContext | null>(null)

export function useModalContext () {
  const context = useContext(modalContext)

  if (context === null) {
    throw new Error(
      'useModalContext must be used within a ModalContextProvider'
    )
  }

  return context
}

export function ModalContextProvider (props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  children: JSXElement
}) {
  // eslint-disable-next-line solid/reactivity

  const [innerVisible, setInnerVisible] = createSignal(false)

  createEffect(() => {
    console.debug('[ModalContextProvider] <effect> visible -> innerVisible: ', props.visible())

    setInnerVisible(props.visible())
  })

  createEffect(() => {
    console.debug('[ModalContextProvider] <effect> innerVisible -> visible: ', innerVisible())

    props.setVisible(innerVisible())
  })

  return (
    <modalContext.Provider value={{ visible: innerVisible, setVisible: setInnerVisible }}>
      {props.children}
    </modalContext.Provider>
  )
}
