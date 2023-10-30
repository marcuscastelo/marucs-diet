import {
  currentDayDiet,
  dayDiets,
  fetchDayDiets,
  targetDay,
} from '@/modules/diet/day-diet/application/dayDiet'
import { DayDiet } from '@/modules/diet/day-diet/domain/dayDiet'
import { createSupabaseDayRepository } from '@/modules/diet/day-diet/infrastructure/supabaseDayRepository'
import { Meal } from '@/modules/diet/meal/domain/meal'
import { createDerivedMealRepository } from '@/modules/diet/meal/infrastructure/derivedMealRepository'
import { currentUserId } from '@/modules/user/application/user'
import { computed } from '@preact/signals-react'

const mealRepository = createDerivedMealRepository(
  dayDiets,
  createSupabaseDayRepository(),
)

// TODO: Maybe replace empty arrays with loading state (null or something)
export const dayMeals = computed(() => currentDayDiet.value?.meals ?? [])

export async function updateMeal(
  dayId: DayDiet['id'],
  mealId: Meal['id'],
  newMeal: Meal,
) {
  const meal = await mealRepository.updateMeal(dayId, mealId, newMeal)
  // TODO: Replace imperative fetching with signals
  fetchDayDiets(currentUserId.value ?? 3)
}
