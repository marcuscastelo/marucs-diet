import {
  currentDayDiet,
  updateDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import {
  demoteNewDayDiet,
  type NewDayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import { updateMealInDayDiet } from '~/modules/diet/day-diet/domain/dayDietOperations'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import {
  addItemToMeal,
  removeItemFromMeal,
  updateItemInMeal,
} from '~/modules/diet/meal/domain/mealOperations'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import {
  handleApplicationError,
  handleInfrastructureError,
  handleValidationError,
} from '~/shared/error/errorHandler'

/**
 * Inserts a UnifiedItem directly into a meal (new unified approach)
 */
export async function insertUnifiedItem(
  mealId: Meal['id'],
  newUnifiedItem: UnifiedItem,
) {
  try {
    const currentDayDiet_ = currentDayDiet()
    if (currentDayDiet_ === null) {
      throw new Error('[meal::application] Current day diet is null')
    }

    // Find the meal to update
    const meal = currentDayDiet_.meals.find((m) => m.id === mealId)
    if (meal === undefined) {
      throw new Error(`Meal with id ${mealId} not found`)
    }

    // Add unified item to meal
    const updatedMeal = addItemToMeal(meal, newUnifiedItem)

    // Update meal in day diet
    const updatedDayDiet = updateMealInDayDiet(
      currentDayDiet_,
      mealId,
      updatedMeal,
    )

    // Convert to NewDayDiet
    const newDay: NewDayDiet = demoteNewDayDiet(updatedDayDiet)

    await updateDayDiet(currentDayDiet_.id, newDay)
  } catch (error) {
    handleInfrastructureError(error, {
      operation: 'moduleOperation',
      entityType: 'Entity',
      module: 'module',
      component: 'application',
    })
    throw error
  }
}

/**
 * Updates a UnifiedItem in a meal (new unified approach)
 */
export async function updateUnifiedItem(
  mealId: Meal['id'],
  itemId: UnifiedItem['id'],
  newUnifiedItem: UnifiedItem,
) {
  try {
    const currentDayDiet_ = currentDayDiet()
    if (currentDayDiet_ === null) {
      throw new Error('[meal::application] Current day diet is null')
    }

    // Find the meal to update
    const meal = currentDayDiet_.meals.find((m) => m.id === mealId)
    if (meal === undefined) {
      throw new Error(`Meal with id ${mealId} not found`)
    }

    // Update unified item in meal
    const updatedMeal = updateItemInMeal(meal, itemId, newUnifiedItem)

    // Update meal in day diet
    const updatedDayDiet = updateMealInDayDiet(
      currentDayDiet_,
      mealId,
      updatedMeal,
    )

    // Convert to NewDayDiet
    const newDay = demoteNewDayDiet(updatedDayDiet)

    await updateDayDiet(currentDayDiet_.id, newDay)
  } catch (error) {
    handleInfrastructureError(error, {
      operation: 'moduleOperation',
      entityType: 'Entity',
      module: 'module',
      component: 'application',
    })
    throw error
  }
}

/**
 * Deletes a UnifiedItem from a meal (new unified approach)
 */
export async function deleteUnifiedItem(
  mealId: Meal['id'],
  itemId: UnifiedItem['id'],
) {
  try {
    const currentDayDiet_ = currentDayDiet()
    if (currentDayDiet_ === null) {
      throw new Error('[meal::application] Current day diet is null')
    }

    // Find the meal to update
    const meal = currentDayDiet_.meals.find((m) => m.id === mealId)
    if (meal === undefined) {
      throw new Error(`Meal with id ${mealId} not found`)
    }

    // Remove unified item from meal
    const updatedMeal = removeItemFromMeal(meal, itemId)

    // Update meal in day diet
    const updatedDayDiet = updateMealInDayDiet(
      currentDayDiet_,
      mealId,
      updatedMeal,
    )

    // Convert to NewDayDiet
    const newDay = demoteNewDayDiet(updatedDayDiet)

    await updateDayDiet(currentDayDiet_.id, newDay)
  } catch (error) {
    handleInfrastructureError(error, {
      operation: 'moduleOperation',
      entityType: 'Entity',
      module: 'module',
      component: 'application',
    })
    throw error
  }
}
