// TODO: Remove deprecated DayDietEditor usage - Replace with pure functions
import { DayDietEditor } from '~/legacy/utils/data/dayDietEditor'
import {
  currentDayDiet,
  updateDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import {
  createNewDayDiet,
  type NewDayDiet,
  type DayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import { handleApiError } from '~/shared/error/errorHandler'

export function insertItemGroup(
  _dayId: DayDiet['id'], // TODO: Remove dayId from functions that don't need it.
  mealId: Meal['id'],
  newItemGroup: ItemGroup,
) {
  const currentDayDiet_ = currentDayDiet()
  if (currentDayDiet_ === null) {
    throw new Error('[meal::application] Current day diet is null')
  }

  const newDay = new DayDietEditor(createNewDayDiet(currentDayDiet_))
    .editMeal(mealId, (mealEditor) => {
      mealEditor?.addGroup(newItemGroup)
    })
    .finish()

  updateDayDiet(currentDayDiet_.id, newDay).catch((error) => {
    handleApiError(error, {
      component: 'itemGroupApplication',
      operation: 'insertItemGroup',
      additionalData: { mealId, groupName: newItemGroup.name },
    })
  })
}

export function updateItemGroup(
  _dayId: DayDiet['id'], // TODO: Remove dayId from functions that don't need it.
  mealId: Meal['id'],
  itemGroupId: ItemGroup['id'],
  newItemGroup: ItemGroup,
) {
  const currentDayDiet_ = currentDayDiet()
  if (currentDayDiet_ === null) {
    throw new Error('[meal::application] Current day diet is null')
  }

  const newDay: NewDayDiet = new DayDietEditor(
    createNewDayDiet(currentDayDiet_),
  )
    .editMeal(mealId, (mealEditor) => {
      mealEditor?.editGroup(itemGroupId, (groupEditor) => {
        groupEditor?.replace(newItemGroup)
      })
    })
    .finish()

  updateDayDiet(currentDayDiet_.id, newDay).catch((error) => {
    handleApiError(error, {
      component: 'itemGroupApplication',
      operation: 'updateItemGroup',
      additionalData: { mealId, itemGroupId, groupName: newItemGroup.name },
    })
  })
}

export function deleteItemGroup(
  _dayId: DayDiet['id'], // TODO: Remove dayId from functions that don't need it
  mealId: Meal['id'],
  itemGroupId: ItemGroup['id'],
) {
  const currentDayDiet_ = currentDayDiet()
  if (currentDayDiet_ === null) {
    throw new Error('[meal::application] Current day diet is null')
  }

  const newDay = new DayDietEditor(createNewDayDiet(currentDayDiet_))
    .editMeal(mealId, (mealEditor) => {
      mealEditor?.deleteGroup(itemGroupId)
    })
    .finish()

  updateDayDiet(currentDayDiet_.id, newDay).catch((error) => {
    handleApiError(error, {
      component: 'itemGroupApplication',
      operation: 'deleteItemGroup',
      additionalData: { mealId, itemGroupId },
    })
  })
}
