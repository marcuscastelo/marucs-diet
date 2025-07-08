import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { type Meal } from '~/modules/diet/meal/domain/meal'

export function updateMealInDayDiet(
  dayDiet: DayDiet,
  mealId: Meal['id'],
  updatedMeal: Meal,
): DayDiet {
  return {
    ...dayDiet,
    meals: dayDiet.meals.map((meal) =>
      meal.id === mealId ? updatedMeal : meal,
    ),
  }
}
