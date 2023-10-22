import { DayDiet } from '@/modules/diet/day-diet/domain/day'
import { DbReady } from '@/src/legacy/utils/newDbRecord'
import { Meal } from '@/src/modules/diet/meal/domain/meal'

// TODO: Make meal not a subcollection of day
export interface MealRepository {
  fetchDayMeals(dayId: DayDiet['id']): Promise<readonly Meal[]>
  insertMeal(dayId: DayDiet['id'], newMeal: Meal): Promise<Meal | undefined>
  updateMeal(
    dayId: DayDiet['id'],
    mealId: Meal['id'],
    newMeal: Meal,
  ): Promise<Meal | undefined>
  deleteMeal(dayId: DayDiet['id'], id: DayDiet['id']): Promise<void>
}
