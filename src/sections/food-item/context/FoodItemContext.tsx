'use client'

import { TemplateItem } from '@/src/modules/diet/template-item/domain/templateItem'
import { ReadonlySignal } from '@preact/signals-react'
import { ReactNode } from 'react'
import { createContext, useContext } from 'use-context-selector'

// TODO: Rename to TemplateItemContext
const FoodItemContext = createContext<{
  foodItem: ReadonlySignal<TemplateItem>
} | null>(null)

export function useFoodItemContext() {
  const context = useContext(FoodItemContext)

  if (!context) {
    throw new Error(
      'useFoodItemContext must be used within a FoodItemContextProvider',
    )
  }

  return context
}

// TODO: Rename to TemplateItemContext
export function FoodItemContextProvider({
  foodItem,
  children,
}: {
  foodItem: ReadonlySignal<TemplateItem>
  children: ReactNode
}) {
  return (
    <FoodItemContext.Provider value={{ foodItem }}>
      {children}
    </FoodItemContext.Provider>
  )
}
