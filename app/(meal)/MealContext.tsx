'use client'

import { Meal } from '@/model/mealModel'
import { ReadonlySignal } from '@preact/signals-react'
import { createContext, useContext } from 'use-context-selector'

const MealContext = createContext<{ meal: ReadonlySignal<Meal> } | null>(null)

export function useMealContext() {
  const context = useContext(MealContext)

  if (!context) {
    throw new Error('useMealContext must be used within a MealContextProvider')
  }

  return context
}

export function MealContextProvider({
  meal,
  children,
}: {
  meal: ReadonlySignal<Meal>
  children: React.ReactNode
}) {
  return (
    <MealContext.Provider value={{ meal }}>{children}</MealContext.Provider>
  )
}
