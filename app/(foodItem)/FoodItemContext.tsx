'use client'

import { FoodItem } from '@/model/foodItemModel'
import { ReactNode } from 'react'
import { createContext, useContext } from 'use-context-selector'

// TODO: Rename CustomFoodItem to something more meaningful
type CustomFoodItem = FoodItem & { type: 'food' | 'recipe' }

const FoodItemContext = createContext<{
  foodItem: CustomFoodItem
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
  foodItem: CustomFoodItem
  children: ReactNode
}) {
  return (
    <FoodItemContext.Provider value={{ foodItem }}>
      {children}
    </FoodItemContext.Provider>
  )
}
