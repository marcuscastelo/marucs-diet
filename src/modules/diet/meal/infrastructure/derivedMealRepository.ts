import { DayDiet } from '@/src/modules/diet/day-diet/domain/day'
import { DayRepository } from '@/src/modules/diet/day-diet/domain/dayRepository'
import { MealRepository } from '@/src/modules/diet/meal/domain/mealRepository'
import { ReadonlySignal } from '@preact/signals-react'

export function createDerivedMealRepository(
  localDays: ReadonlySignal<readonly DayDiet[]>,
  dayRepository: DayRepository,
): MealRepository {
  return {
    fetchDayMeals: async (dayId) => {
      const day = localDays.value.find((day) => day.id === dayId)
      if (!day) {
        throw new Error(`Day ${dayId} not found`)
      }

      await dayRepository.fetchUserDays(day?.owner)
      const updatedDay = localDays.value.find((day) => day.id === dayId)
      if (!updatedDay) {
        throw new Error(`Day ${dayId} not found`)
      }

      return updatedDay.meals
    },
    updateMeal: async (dayId, mealId, newMeal) => {
      console.debug(
        `[derivedMealRepository] updateMeal(${dayId}, ${mealId}) => ${JSON.stringify(
          newMeal,
        )}`,
      )
      const day = localDays.value.find((day) => day.id === dayId)
      if (!day) {
        throw new Error(`Day ${dayId} not found`)
      }

      const newDay = {
        ...day,
        meals: day.meals.map((meal) => (meal.id === mealId ? newMeal : meal)),
      }

      return (await dayRepository.updateDay(dayId, newDay)).meals.find(
        (meal) => meal.id === mealId,
      )
    },
    insertMeal: async (dayId, newMeal) => {
      const day = localDays.value.find((day) => day.id === dayId)
      if (!day) {
        throw new Error(`Day ${dayId} not found`)
      }

      const newDay = {
        ...day,
        meals: [...day.meals, newMeal],
      }

      return (await dayRepository.updateDay(dayId, newDay)).meals.find(
        (meal) => meal.id === newMeal.id,
      )
    },
    deleteMeal: async (dayId, mealId) => {
      const day = localDays.value.find((day) => day.id === dayId)
      if (!day) {
        throw new Error(`Day ${dayId} not found`)
      }

      const newDay = {
        ...day,
        meals: day.meals.filter((meal) => meal.id !== mealId),
      }

      await dayRepository.updateDay(dayId, newDay)
    },
  }
}
