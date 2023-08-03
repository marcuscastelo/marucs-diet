'use client'

import { FoodItem } from '@/model/foodItemModel'
import { ReactNode, createContext, useContext } from 'react'

const FoodItemContext = createContext<{ foodItem: FoodItem } | null>(null)

export function useFoodItemContext() {
  const context = useContext(FoodItemContext)

  if (!context) {
    throw new Error(
      'useMealItemContext must be used within a MealItemContextProvider',
    )
  }

  return context
}

export function FoodItemContextProvider({
  foodItem,
  children,
}: {
  foodItem: FoodItem
  children: ReactNode
}) {
  return (
    <FoodItemContext.Provider value={{ foodItem }}>
      {children}
    </FoodItemContext.Provider>
  )
}
