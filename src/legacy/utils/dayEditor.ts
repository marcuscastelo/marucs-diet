import { Day } from '@/modules/day/domain/day'
import { ItemGroup } from '@/modules/item-group/domain/itemGroup'
import { Meal } from '@/modules/meal/domain/meal'

// TODO: Create DayEditor class (after meal becomes a DB model) and deprecate this function (and others)
// TODO: Move updateItemGroupInDay to controllers/day.ts?
// TODO: Does this function already exist somewhere else? (I think so)
/**
 * @deprecated
 */
export function addItemGroupToMeal(day: Day, meal: Meal, newGroup: ItemGroup) {
  const oldMeal = { ...meal }
  const newMeal: Meal = {
    ...oldMeal,
    groups: [...oldMeal.groups, newGroup] satisfies Meal['groups'],
  }

  const oldMeals = [...day.meals]

  const newMeals: Meal[] = [...oldMeals]
  const changePos = newMeals.findIndex((m) => m.id === oldMeal.id)

  if (changePos === -1) {
    throw new Error('Meal not found! Searching for id: ' + oldMeal.id)
  }

  newMeals[changePos] = newMeal

  const newDay: Day = {
    ...day,
    meals: newMeals,
  }

  return newDay
}
