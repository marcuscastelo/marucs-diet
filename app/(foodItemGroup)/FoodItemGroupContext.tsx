'use client'

import { FoodItemGroup } from '@/model/foodItemGroupModel'
import { ReactNode, createContext, useContext } from 'react'

const FoodItemGroupContext = createContext<{
  foodItemGroup: FoodItemGroup
} | null>(null)

export function useFoodItemGroupContext() {
  const context = useContext(FoodItemGroupContext)

  if (!context) {
    throw new Error(
      'useMealItemContext must be used within a MealItemContextProvider',
    )
  }

  return context
}

export function FoodItemGroupContextProvider({
  foodItemGroup,
  children,
}: {
  foodItemGroup: FoodItemGroup
  children: ReactNode
}) {
  return (
    <FoodItemGroupContext.Provider value={{ foodItemGroup }}>
      {children}
    </FoodItemGroupContext.Provider>
  )
}
