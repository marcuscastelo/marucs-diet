import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import {
  type Accessor,
  type JSXElement,
  createContext,
  useContext,
} from 'solid-js'
import { createMirrorSignal } from '~/sections/common/hooks/createMirrorSignal'

// TODO: Rename to TemplateItemContext
const FoodItemContext = createContext<{
  foodItem: Accessor<TemplateItem>
  macroOverflow: () => {
    enable: boolean
    originalItem?: TemplateItem | undefined
  }
} | null>(null)

export function useFoodItemContext() {
  const context = useContext(FoodItemContext)

  if (context === null) {
    throw new Error(
      'useFoodItemContext must be used within a FoodItemContextProvider',
    )
  }

  return context
}

// TODO: Rename to TemplateItemContext
export function FoodItemContextProvider(props: {
  foodItem: Accessor<TemplateItem>
  macroOverflow: () => {
    enable: boolean
    originalItem?: TemplateItem | undefined
  }
  children: JSXElement
}) {
  const defaultOptions = {
    enable: () => false,
  }

  return (
    <FoodItemContext.Provider
      value={{
        foodItem: () => props.foodItem(),
        macroOverflow: () => props.macroOverflow() ?? defaultOptions,
      }}
    >
      {props.children}
    </FoodItemContext.Provider>
  )
}
