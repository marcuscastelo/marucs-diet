import {
  currentDayDiet,
  updateDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import {
  type DayDiet,
  type NewDayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import {
  convertToNewDayDiet,
  updateMealInDayDiet,
} from '~/modules/diet/day-diet/domain/dayDietOperations'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import {
  addGroupToMeal,
  addItemToMeal,
  removeGroupFromMeal,
  removeItemFromMeal,
  updateGroupInMeal,
  updateItemInMeal,
} from '~/modules/diet/meal/domain/mealOperations'
import { itemGroupToUnifiedItem } from '~/modules/diet/unified-item/domain/conversionUtils'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { handleApiError } from '~/shared/error/errorHandler'

/**
 * @deprecated Use insertUnifiedItem instead
 */
export async function insertItemGroup(
  mealId: Meal['id'],
  newItemGroup: ItemGroup,
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

    // Add group to meal (converts to UnifiedItems internally)
    const updatedMeal = addGroupToMeal(meal, newItemGroup)

    // Update meal in day diet
    const updatedDayDiet = updateMealInDayDiet(
      currentDayDiet_,
      mealId,
      updatedMeal,
    )

    // Convert to NewDayDiet
    const newDay = convertToNewDayDiet(updatedDayDiet)

    await updateDayDiet(currentDayDiet_.id, newDay)
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export async function updateItemGroup(
  mealId: Meal['id'],
  itemGroupId: ItemGroup['id'],
  newItemGroup: ItemGroup,
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

    // Update group in meal
    const updatedMeal = updateGroupInMeal(meal, itemGroupId, newItemGroup)

    // Update meal in day diet
    const updatedDayDiet = updateMealInDayDiet(
      currentDayDiet_,
      mealId,
      updatedMeal,
    )

    // Convert to NewDayDiet
    const newDay: NewDayDiet = convertToNewDayDiet(updatedDayDiet)

    await updateDayDiet(currentDayDiet_.id, newDay)
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export async function deleteItemGroup(
  mealId: Meal['id'],
  itemGroupId: ItemGroup['id'],
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

    // Remove group from meal
    const updatedMeal = removeGroupFromMeal(meal, itemGroupId)

    // Update meal in day diet
    const updatedDayDiet = updateMealInDayDiet(
      currentDayDiet_,
      mealId,
      updatedMeal,
    )

    // Convert to NewDayDiet
    const newDay = convertToNewDayDiet(updatedDayDiet)

    await updateDayDiet(currentDayDiet_.id, newDay)
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

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
    const newDay = convertToNewDayDiet(updatedDayDiet)

    await updateDayDiet(currentDayDiet_.id, newDay)
  } catch (error) {
    handleApiError(error)
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
    const newDay = convertToNewDayDiet(updatedDayDiet)

    await updateDayDiet(currentDayDiet_.id, newDay)
  } catch (error) {
    handleApiError(error)
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
    const newDay = convertToNewDayDiet(updatedDayDiet)

    await updateDayDiet(currentDayDiet_.id, newDay)
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

/**
 * Converts ItemGroup to UnifiedItem and inserts it (compatibility helper)
 */
export async function insertItemGroupAsUnified(
  mealId: Meal['id'],
  itemGroup: ItemGroup,
) {
  const unifiedItem = itemGroupToUnifiedItem(itemGroup)
  return insertUnifiedItem(mealId, unifiedItem)
}
