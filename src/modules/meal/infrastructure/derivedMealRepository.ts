import { Day } from '@/src/modules/day/domain/day'
import { DayRepository } from '@/src/modules/day/domain/dayRepository'
import { MealRepository } from '@/src/modules/meal/domain/mealRepository'

export function createDerivedMealRepository(
  localDays: readonly Day[],
  dayRepository: Omit<DayRepository, 'fetchUserDays'>,
): MealRepository {
  return {
    fetchDayMeals: async (dayId) => {
      const day = localDays.find((day) => day.id === dayId)
      if (!day) {
        throw new Error(`Day ${dayId} not found`)
      }
      return day.meals
    },
    updateMeal: async (dayId, mealId, newMeal) => {
      console.debug(
        `[derivedMealRepository] updateMeal(${dayId}, ${mealId}) => ${JSON.stringify(
          newMeal,
        )}`,
      )
      const day = localDays.find((day) => day.id === dayId)
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
      const day = localDays.find((day) => day.id === dayId)
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
      const day = localDays.find((day) => day.id === dayId)
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
