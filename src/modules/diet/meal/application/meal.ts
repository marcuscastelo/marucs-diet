import { DayDietEditor } from '@/legacy/utils/data/dayDietEditor'
import {
  currentDayDiet,
  updateDayDiet
} from '@/modules/diet/day-diet/application/dayDiet'
import { type DayDiet } from '@/modules/diet/day-diet/domain/dayDiet'
import { type Meal } from '@/modules/diet/meal/domain/meal'

// TODO: Maybe replace empty arrays with loading state (null or something)
export const dayMeals = () => currentDayDiet()?.meals ?? []

export async function updateMeal (
  _dayId: DayDiet['id'], // TODO: Remove dayId from functions that don't need it
  mealId: Meal['id'],
  newMeal: Meal
) {
  const currentDayDiet_ = currentDayDiet()
  if (currentDayDiet_ === null) {
    throw new Error('[meal::application] Current day diet is null')
  }

  const newDay = new DayDietEditor(currentDayDiet_)
    .editMeal(mealId, (editor) => {
      editor?.replace(newMeal)
    })
    .finish()

  updateDayDiet(currentDayDiet_.id, newDay)
}
