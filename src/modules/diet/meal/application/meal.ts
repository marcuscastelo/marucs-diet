import {
  currentDayDiet,
  updateDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import {
  updateMealInDayDiet,
  convertToNewDayDiet,
} from '~/modules/diet/day-diet/domain/dayDietOperations'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import { handleApiError } from '~/shared/error/errorHandler'

// TODO:   Maybe replace empty arrays with loading state (null or something)
export const dayMeals = () => currentDayDiet()?.meals ?? []

export async function updateMeal(
  _dayId: DayDiet['id'], // TODO:   Remove dayId from functions that don't need it
  mealId: Meal['id'],
  newMeal: Meal,
) {
  try {
    const currentDayDiet_ = currentDayDiet()
    if (currentDayDiet_ === null) {
      throw new Error('[meal::application] Current day diet is null')
    }

    // Update meal in day diet
    const updatedDayDiet = updateMealInDayDiet(currentDayDiet_, mealId, newMeal)

    // Convert to NewDayDiet
    const newDay = convertToNewDayDiet(updatedDayDiet)

    await updateDayDiet(currentDayDiet_.id, newDay)
  } catch (error) {
    handleApiError(error, {
      component: 'mealApplication',
      operation: 'updateMeal',
      additionalData: { mealId, mealName: newMeal.name },
    })
    throw error
  }
}
