import { Day } from '@/modules/day/domain/day'
import { DbReady } from '@/src/legacy/utils/newDbRecord'
import { Meal } from '@/src/modules/meal/domain/meal'

// TODO: Make meal not a subcollection of day
export interface MealRepository {
  fetchDayMeals(dayId: Day['id']): Promise<readonly Meal[]>
  insertMeal(dayId: Day['id'], newMeal: Meal): Promise<Meal | undefined>
  updateMeal(
    dayId: Day['id'],
    mealId: Meal['id'],
    newMeal: Meal,
  ): Promise<Meal | undefined>
  deleteMeal(dayId: Day['id'], id: Day['id']): Promise<void>
}
