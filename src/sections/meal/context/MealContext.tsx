'use client'

import { Meal } from '@/src/modules/diet/meal/domain/meal'
import { Loadable } from '@/src/legacy/utils/loadable'
import { DayDiet } from '@/src/modules/diet/day-diet/domain/dayDiet'
import { MealRepository } from '@/src/modules/diet/meal/domain/mealRepository'
import { ReadonlySignal, useSignal } from '@preact/signals-react'
import { createContext, useContext } from 'use-context-selector'

export type MealContextProps = {
  meals: ReadonlySignal<Loadable<readonly Meal[]>>
  refetchMeals: (dayId: DayDiet['id']) => void
  insertMeal: (dayId: DayDiet['id'], meal: Meal) => void
  updateMeal: (dayId: DayDiet['id'], mealId: Meal['id'], meal: Meal) => void
  deleteMeal: (dayId: DayDiet['id'], mealId: Meal['id']) => void
}

const MealContext = createContext<MealContextProps | null>(null)

export function useMealContext() {
  const context = useContext(MealContext)

  if (!context) {
    throw new Error('useMealContext must be used within a MealContextProvider')
  }

  return context
}

export function MealContextProvider({
  children,
  repository,
}: {
  children: React.ReactNode
  repository: ReadonlySignal<MealRepository | null>
}) {
  console.debug(`[MealContextProvider] - Rendering`)

  const meals = useSignal<Loadable<readonly Meal[]>>({
    loading: true,
  })

  const handleFetchMeals = (dayId: DayDiet['id']) => {
    repository.value
      ?.fetchDayMeals(dayId)
      .then((foundMeals) => {
        meals.value = { loading: false, errored: false, data: foundMeals }
      })
      .catch((error) => {
        meals.value = { loading: false, errored: true, error }
      })
  }

  const handleInsertMeal = (dayId: DayDiet['id'], meal: Meal) => {
    repository.value
      ?.insertMeal(dayId, meal)
      .then(() => handleFetchMeals(dayId))
  }

  const handleUpdateMeal = (
    dayId: DayDiet['id'],
    mealId: Meal['id'],
    meal: Meal,
  ) => {
    repository.value
      ?.updateMeal(dayId, mealId, meal)
      .then(() => handleFetchMeals(dayId))
  }

  const handleDeleteMeal = (dayId: DayDiet['id'], mealId: Meal['id']) => {
    repository.value
      ?.deleteMeal(dayId, mealId)
      .then(() => handleFetchMeals(dayId))
  }

  return (
    <MealContext.Provider
      value={{
        meals: meals as ReadonlySignal<Loadable<readonly Meal[]>>,
        refetchMeals: handleFetchMeals,
        insertMeal: handleInsertMeal,
        updateMeal: handleUpdateMeal,
        deleteMeal: handleDeleteMeal,
      }}
    >
      {children}
    </MealContext.Provider>
  )
}

/**
 * @deprecated
 */
const MealContextOld = createContext<{ meal: ReadonlySignal<Meal> } | null>(
  null,
)

/**
 * @deprecated
 */
export function useMealContextOld() {
  const context = useContext(MealContextOld)

  if (!context) {
    throw new Error('useMealContext must be used within a MealContextProvider')
  }

  return context
}

/**
 * @deprecated
 */
export function MealContextProviderOld({
  meal,
  children,
}: {
  meal: ReadonlySignal<Meal>
  children: React.ReactNode
}) {
  return (
    <MealContextOld.Provider value={{ meal }}>
      {children}
    </MealContextOld.Provider>
  )
}
