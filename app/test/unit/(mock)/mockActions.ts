import { Meal } from '@/model/mealModel'
import { Dispatch, SetStateAction } from 'react'

export const duplicateLastMealItem = (
  meal: Meal,
  setMeal: Dispatch<SetStateAction<Meal>>,
) => {
  const lastItem = meal.groups[meal.groups.length - 1]
  const newItem = {
    ...lastItem,
    id: lastItem.id + 1,
  }
  setMeal({
    ...meal,
    groups: [...meal.groups, newItem],
  })
}
