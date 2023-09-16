'use client'

import { TemplateItem } from '@/model/templateItemModel'
import { ReactNode } from 'react'
import { createContext, useContext } from 'use-context-selector'

// TODO: Rename to TemplateItemContext
const FoodItemContext = createContext<{
  foodItem: TemplateItem
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
  foodItem: TemplateItem
  children: ReactNode
}) {
  return (
    <FoodItemContext.Provider value={{ foodItem }}>
      {children}
    </FoodItemContext.Provider>
  )
}
