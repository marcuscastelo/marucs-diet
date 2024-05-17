import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import {
  type Accessor,
  type JSXElement,
  createContext,
  useContext,
} from 'solid-js'

// TODO: Rename to TemplateItemContext
const FoodItemContext = createContext<{
  foodItem: Accessor<TemplateItem>
  macroOverflowOptions: () => {
    enable: () => boolean
    originalItem?: () => TemplateItem | undefined
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
  macroOverflowOptions?: () => {
    enable: () => boolean
    originalItem?: () => TemplateItem | undefined
  }
  children: JSXElement
}) {
  const macroOverflowOptionsSignal = () => {
    if (props.macroOverflowOptions !== undefined) {
      return props.macroOverflowOptions()
    }
    return {
      enable: () => false,
    }
  }

  return (
    <FoodItemContext.Provider
      value={{
        foodItem: () => props.foodItem(),
        macroOverflowOptions: macroOverflowOptionsSignal,
      }}
    >
      {props.children}
    </FoodItemContext.Provider>
  )
}
