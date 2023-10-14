import { Meal } from '@/model/mealModel'
import { Signal } from '@preact/signals-react'

export const duplicateLastItemGroup = (meal: Signal<Meal>) => {
  const lastItem = meal.value.groups[meal.value.groups.length - 1]
  const newGroup = {
    ...lastItem,
    id: lastItem.id + 1,
  }
  meal.value = {
    ...meal.value,
    groups: [...meal.peek().groups, newGroup],
  }
}
