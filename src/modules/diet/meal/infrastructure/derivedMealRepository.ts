import { type DayDiet } from '@/modules/diet/day-diet/domain/dayDiet'
import { type DayRepository } from '@/modules/diet/day-diet/domain/dayDietRepository'
import { type MealRepository } from '@/modules/diet/meal/domain/mealRepository'
import { type Accessor } from 'solid-js'

// TODO: Replace localDays with localDay
export function createDerivedMealRepository (
  localDays: Accessor<readonly DayDiet[]>,
  dayRepository: DayRepository
): MealRepository {
  return {
    fetchDayMeals: async (dayId) => {
      const day = localDays().find((day) => day.id === dayId)
      if (day === undefined) {
        throw new Error(`Day ${dayId} not found`)
      }

      await dayRepository.fetchAllUserDayDiets(day?.owner)
      const updatedDay = localDays().find((day) => day.id === dayId)
      if (updatedDay === undefined) {
        throw new Error(`Day ${dayId} not found`)
      }

      return updatedDay.meals
    },
    updateMeal: async (dayId, mealId, newMeal) => {
      console.debug(
        `[derivedMealRepository] updateMeal(${dayId}, ${mealId}) => ${JSON.stringify(
          newMeal
        )}`
      )
      const day = localDays().find((day) => day.id === dayId)
      if (day === undefined) {
        throw new Error(`Day ${dayId} not found`)
      }

      const newDay = {
        ...day,
        meals: day.meals.map((meal) => (meal.id === mealId ? newMeal : meal))
      }

      return (await dayRepository.updateDayDiet(dayId, newDay)).meals.find(
        (meal) => meal.id === mealId
      )
    },
    insertMeal: async (dayId, newMeal) => {
      const day = localDays().find((day) => day.id === dayId)
      if (day === undefined) {
        throw new Error(`Day ${dayId} not found`)
      }

      const newDay = {
        ...day,
        meals: [...day.meals, newMeal]
      }

      return (await dayRepository.updateDayDiet(dayId, newDay)).meals.find(
        (meal) => meal.id === newMeal.id
      )
    },
    deleteMeal: async (dayId, mealId) => {
      const day = localDays().find((day) => day.id === dayId)
      if (day === undefined) {
        throw new Error(`Day ${dayId} not found`)
      }

      const newDay = {
        ...day,
        meals: day.meals.filter((meal) => meal.id !== mealId)
      }

      await dayRepository.updateDayDiet(dayId, newDay)
    }
  }
}
