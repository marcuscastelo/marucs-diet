import { type TemplateItem } from '@/modules/diet/template-item/domain/templateItem'
import { type Accessor, type JSXElement, createContext, useContext } from 'solid-js'

// TODO: Rename to TemplateItemContext
const FoodItemContext = createContext<{
  foodItem: Accessor<TemplateItem>
} | null>(null)

export function useFoodItemContext () {
  const context = useContext(FoodItemContext)

  if (context === null) {
    throw new Error(
      'useFoodItemContext must be used within a FoodItemContextProvider'
    )
  }

  return context
}

// TODO: Rename to TemplateItemContext
export function FoodItemContextProvider (props: {
  foodItem: Accessor<TemplateItem>
  children: JSXElement
}) {
  return (
    <FoodItemContext.Provider value={{ foodItem: () => props.foodItem() }}>
      {props.children}
    </FoodItemContext.Provider>
  )
}
