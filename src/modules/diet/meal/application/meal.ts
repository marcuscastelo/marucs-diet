import {
  currentDayDiet,
  updateDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import {
  convertToNewDayDiet,
  updateMealInDayDiet,
} from '~/modules/diet/day-diet/domain/dayDietOperations'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import { handleApiError } from '~/shared/error/errorHandler'

// TODO:   Maybe replace empty arrays with loading state (null or something)
export const dayMeals = () => currentDayDiet()?.meals ?? []
// TODO:   Remove dayId from functions that don't need it

/**
 * Updates a meal in the current day diet.
 * @param _dayId - The day diet ID (unused).
 * @param mealId - The meal ID.
 * @param newMeal - The new meal data.
 * @returns True if updated, false otherwise.
 */
export async function updateMeal(
  _dayId: DayDiet['id'],
  mealId: Meal['id'],
  newMeal: Meal,
): Promise<boolean> {
  try {
    const currentDayDiet_ = currentDayDiet()
    if (currentDayDiet_ === null) {
      handleApiError('[meal::application] Current day diet is null', {
        component: 'mealApplication',
        operation: 'updateMeal',
        additionalData: { mealId, mealName: newMeal.name },
      })
      return false
    }
    const updatedDayDiet = updateMealInDayDiet(currentDayDiet_, mealId, newMeal)
    const newDay = convertToNewDayDiet(updatedDayDiet)
    await updateDayDiet(currentDayDiet_.id, newDay)
    return true
  } catch (error) {
    handleApiError(error, {
      component: 'mealApplication',
      operation: 'updateMeal',
      additionalData: { mealId, mealName: newMeal.name },
    })
    return false
  }
}
