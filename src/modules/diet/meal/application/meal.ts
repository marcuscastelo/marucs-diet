import {
  currentDayDiet,
  dayDiets,
  fetchDayDiets
} from '@/modules/diet/day-diet/application/dayDiet'
import { type DayDiet } from '@/modules/diet/day-diet/domain/dayDiet'
import { createSupabaseDayRepository } from '@/modules/diet/day-diet/infrastructure/supabaseDayRepository'
import { type Meal } from '@/modules/diet/meal/domain/meal'
import { createDerivedMealRepository } from '@/modules/diet/meal/infrastructure/derivedMealRepository'
import { currentUserId } from '@/modules/user/application/user'

const mealRepository = createDerivedMealRepository(
  dayDiets,
  createSupabaseDayRepository()
)

// TODO: Maybe replace empty arrays with loading state (null or something)
export const dayMeals = () => currentDayDiet()?.meals ?? []

export async function updateMeal (
  dayId: DayDiet['id'],
  mealId: Meal['id'],
  newMeal: Meal
) {
  await mealRepository.updateMeal(dayId, mealId, newMeal)
  // TODO: Replace imperative fetching with signals
  fetchDayDiets(currentUserId() ?? 3)
}
