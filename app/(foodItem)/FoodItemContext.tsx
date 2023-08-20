'use client'

import { FoodItem } from '@/model/foodItemModel'
import { ReactNode } from 'react'
import { createContext, useContext } from 'use-context-selector'

const FoodItemContext = createContext<{
  foodItem: FoodItem & { type: 'food' | 'recipe' }
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

export function FoodItemContextProvider({
  foodItem,
  children,
}: {
  foodItem: FoodItem & { type: 'food' | 'recipe' }
  children: ReactNode
}) {
  return (
    <FoodItemContext.Provider value={{ foodItem }}>
      {children}
    </FoodItemContext.Provider>
  )
}
