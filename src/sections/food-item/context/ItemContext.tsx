import {
  type Accessor,
  createContext,
  type JSXElement,
  useContext,
} from 'solid-js'

import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'

// TODO:   Rename to TemplateItemContext
const ItemContext = createContext<{
  item: Accessor<TemplateItem>
  macroOverflow: () => {
    enable: boolean
    originalItem?: TemplateItem | undefined
  }
} | null>(null)

export function useItemContext() {
  const context = useContext(ItemContext)

  if (context === null) {
    throw new Error('useItemContext must be used within a ItemContextProvider')
  }

  return context
}

// TODO:   Rename to TemplateItemContext
export function ItemContextProvider(props: {
  item: Accessor<TemplateItem>
  macroOverflow: () => {
    enable: boolean
    originalItem?: TemplateItem | undefined
  }
  children: JSXElement
}) {
  return (
    <ItemContext.Provider
      value={{
        item: () => props.item(),
        macroOverflow: () => props.macroOverflow(),
      }}
    >
      {props.children}
    </ItemContext.Provider>
  )
}
