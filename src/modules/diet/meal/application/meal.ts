import {
  currentDayDiet,
  updateDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import { demoteNewDayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { updateMealInDayDiet } from '~/modules/diet/day-diet/domain/dayDietOperations'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import {
  handleApplicationError,
  handleInfrastructureError,
  handleValidationError,
} from '~/shared/error/errorHandler'

/**
 * Updates a meal in the current day diet.
 * @param mealId - The meal ID.
 * @param newMeal - The new meal data.
 * @returns True if updated, false otherwise.
 */
export async function updateMeal(
  mealId: Meal['id'],
  newMeal: Meal,
): Promise<boolean> {
  try {
    const currentDayDiet_ = currentDayDiet()
    if (currentDayDiet_ === null) {
      handleInfrastructureError(
        new Error('[meal::application] Current day diet is null'),
        {
          operation: 'saveMeal',
          entityType: 'Meal',
          module: 'diet/meal',
          component: 'meal',
        },
      )
      return false
    }
    const updatedDayDiet = updateMealInDayDiet(currentDayDiet_, mealId, newMeal)
    const newDay = demoteNewDayDiet(updatedDayDiet)
    await updateDayDiet(currentDayDiet_.id, newDay)
    return true
  } catch (error) {
    handleInfrastructureError(error, {
      operation: 'moduleOperation',
      entityType: 'Entity',
      module: 'module',
      component: 'application',
    })
    return false
  }
}
