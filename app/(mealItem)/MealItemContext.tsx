'use client'

import { FoodItem } from '@/model/mealItemModel'
import { createContext, useContext } from 'react'

const MealItemContext = createContext<{ mealItem: FoodItem } | null>(null)

export function useMealItemContext() {
  const context = useContext(MealItemContext)

  if (!context) {
    throw new Error(
      'useMealItemContext must be used within a MealItemContextProvider',
    )
  }

  return context
}

export function MealItemContextProvider({
  mealItem,
  children,
}: {
  mealItem: FoodItem
  children: React.ReactNode
}) {
  return (
    <MealItemContext.Provider value={{ mealItem }}>
      {children}
    </MealItemContext.Provider>
  )
}
