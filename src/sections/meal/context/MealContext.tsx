import {
  type Accessor,
  createContext,
  type JSXElement,
  useContext,
} from 'solid-js'

import { type Meal } from '~/modules/diet/meal/domain/meal'

// TODO:   Rename to TemplateItemContext
const mealContext = createContext<{
  meal: Accessor<Meal>
} | null>(null)

export function useMealContext() {
  const context = useContext(mealContext)

  if (context === null) {
    throw new Error('useMealContext must be used within a MealContextProvider')
  }

  return context
}

export function MealContextProvider(props: {
  meal: Accessor<Meal>
  children: JSXElement
}) {
  return (
    <mealContext.Provider value={{ meal: () => props.meal() }}>
      {props.children}
    </mealContext.Provider>
  )
}
