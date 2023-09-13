import { updateDay } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import { ItemGroup } from '@/model/itemGroupModel'
import { Meal } from '@/model/mealModel'

// TODO: Move updateItemGroupInDay to controllers/day.ts?
// TODO: Does this function already exist somewhere else? (I think so)
export async function addItemGroupToMeal(
  day: Day,
  meal: Meal,
  newGroup: ItemGroup,
  callbacks: {
    onFinished?: () => void
  },
) {
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

  await updateDay(day.id, newDay)
  await callbacks.onFinished?.()
}
