import {
  type DayDiet,
  type NewDayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import { type Meal } from '~/modules/diet/meal/domain/meal'

/**
 * Pure functions for day diet operations
 */

export function addMealToDayDiet(dayDiet: DayDiet, meal: Meal): DayDiet {
  return {
    ...dayDiet,
    meals: [...dayDiet.meals, meal],
  }
}

export function addMealsToDayDiet(
  dayDiet: DayDiet,
  meals: readonly Meal[],
): DayDiet {
  return {
    ...dayDiet,
    meals: [...dayDiet.meals, ...meals],
  }
}

export function updateMealInDayDiet(
  dayDiet: DayDiet,
  mealId: Meal['id'],
  updatedMeal: Meal,
): DayDiet {
  return {
    ...dayDiet,
    meals: dayDiet.meals.map((meal) =>
      meal.id === mealId ? updatedMeal : meal,
    ),
  }
}

export function removeMealFromDayDiet(
  dayDiet: DayDiet,
  mealId: Meal['id'],
): DayDiet {
  return {
    ...dayDiet,
    meals: dayDiet.meals.filter((meal) => meal.id !== mealId),
  }
}

export function setDayDietMeals(dayDiet: DayDiet, meals: Meal[]): DayDiet {
  return {
    ...dayDiet,
    meals,
  }
}

export function clearDayDietMeals(dayDiet: DayDiet): DayDiet {
  return {
    ...dayDiet,
    meals: [],
  }
}

export function findMealInDayDiet(
  dayDiet: DayDiet,
  mealId: Meal['id'],
): Meal | undefined {
  return dayDiet.meals.find((meal) => meal.id === mealId)
}

export function replaceDayDiet(
  dayDiet: DayDiet,
  updates: Partial<DayDiet>,
): DayDiet {
  return {
    ...dayDiet,
    ...updates,
  }
}

// Helper for converting DayDiet to NewDayDiet while preserving updates
export function convertToNewDayDiet(dayDiet: DayDiet): NewDayDiet {
  const { id, ...rest } = dayDiet
  return {
    ...rest,
    __type: 'NewDayDiet',
  }
}
