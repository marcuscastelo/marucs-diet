import {
  currentDayDiet,
  updateDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import {
  type NewDayDiet,
  type DayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import {
  updateMealInDayDiet,
  convertToNewDayDiet,
} from '~/modules/diet/day-diet/domain/dayDietOperations'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import {
  addGroupToMeal,
  updateGroupInMeal,
  removeGroupFromMeal,
} from '~/modules/diet/meal/domain/mealOperations'
import { handleApiError } from '~/shared/error/errorHandler'

export function insertItemGroup(
  _dayId: DayDiet['id'], // TODO:   Remove dayId from functions that don't need it.
  mealId: Meal['id'],
  newItemGroup: ItemGroup,
) {
  const currentDayDiet_ = currentDayDiet()
  if (currentDayDiet_ === null) {
    throw new Error('[meal::application] Current day diet is null')
  }

  // Find the meal to update
  const meal = currentDayDiet_.meals.find((m) => m.id === mealId)
  if (meal === null || meal === undefined) {
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

  updateDayDiet(currentDayDiet_.id, newDay).catch((error) => {
    handleApiError(error, {
      component: 'itemGroupApplication',
      operation: 'insertItemGroup',
      additionalData: { mealId, groupName: newItemGroup.name },
    })
  })
}

export function updateItemGroup(
  _dayId: DayDiet['id'], // TODO:   Remove dayId from functions that don't need it.
  mealId: Meal['id'],
  itemGroupId: ItemGroup['id'],
  newItemGroup: ItemGroup,
) {
  const currentDayDiet_ = currentDayDiet()
  if (currentDayDiet_ === null) {
    throw new Error('[meal::application] Current day diet is null')
  }

  // Find the meal to update
  const meal = currentDayDiet_.meals.find((m) => m.id === mealId)
  if (meal === null || meal === undefined) {
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

  updateDayDiet(currentDayDiet_.id, newDay).catch((error) => {
    handleApiError(error, {
      component: 'itemGroupApplication',
      operation: 'updateItemGroup',
      additionalData: { mealId, itemGroupId, groupName: newItemGroup.name },
    })
  })
}

export function deleteItemGroup(
  _dayId: DayDiet['id'], // TODO:   Remove dayId from functions that don't need it
  mealId: Meal['id'],
  itemGroupId: ItemGroup['id'],
) {
  const currentDayDiet_ = currentDayDiet()
  if (currentDayDiet_ === null) {
    throw new Error('[meal::application] Current day diet is null')
  }

  // Find the meal to update
  const meal = currentDayDiet_.meals.find((m) => m.id === mealId)
  if (meal === null || meal === undefined) {
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

  updateDayDiet(currentDayDiet_.id, newDay).catch((error) => {
    handleApiError(error, {
      component: 'itemGroupApplication',
      operation: 'deleteItemGroup',
      additionalData: { mealId, itemGroupId },
    })
  })
}
