'use client'

import { MealData } from '@/model/mealModel'
import { createContext, useContext } from 'react'

const MealContext = createContext<{ mealData: MealData } | null>(null)

export function useMealContext() {
  const context = useContext(MealContext)

  if (!context) {
    throw new Error('useMealContext must be used within a MealContextProvider')
  }

  return context
}

export function MealContextProvider({
  mealData,
  children,
}: {
  mealData: MealData
  children: React.ReactNode
}) {
  return (
    <MealContext.Provider value={{ mealData }}>{children}</MealContext.Provider>
  )
}
