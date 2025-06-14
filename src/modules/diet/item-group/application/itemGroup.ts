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
  removeGroupFromMeal,
  updateGroupInMeal,
} from '~/modules/diet/meal/domain/mealOperations'
import { handleApiError } from '~/shared/error/errorHandler'

export async function insertItemGroup(
  _dayId: DayDiet['id'], // TODO:   Remove dayId from functions that don't need it.
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

    // Add group to meal
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
  _dayId: DayDiet['id'], // TODO:   Remove dayId from functions that don't need it.
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
  _dayId: DayDiet['id'], // TODO:   Remove dayId from functions that don't need it
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
