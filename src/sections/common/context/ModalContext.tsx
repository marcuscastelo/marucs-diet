import {
  type Accessor,
  createContext,
  type JSXElement,
  type Setter,
  useContext,
} from 'solid-js'

type ModalContext = {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
}

const modalContext = createContext<ModalContext | null>(null)

export function useModalContext() {
  const context = useContext(modalContext)

  if (context === null) {
    throw new Error(
      'useModalContext must be used within a ModalContextProvider',
    )
  }

  return context
}

export function ModalContextProvider(props: {
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  children: JSXElement
}) {
  return (
    <modalContext.Provider
      value={{
        visible: props.visible,
        setVisible: props.setVisible,
      }}
    >
      {props.children}
    </modalContext.Provider>
  )
}
