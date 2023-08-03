import { foodItemSchema } from './foodItemModel'

import { z } from 'zod'

export const mealSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: z.array(foodItemSchema),
  '': z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Meal' as const),
})

// TODO: rename MealData to Meal (and Meal component to MealView)
export type MealData = z.infer<typeof mealSchema>

// TODO: Create factory function for other models
export function createMeal({
  name,
  items,
}: {
  name: string
  items: MealData['items']
}): MealData {
  return {
    id: Math.floor(Math.random() * 1000000),
    name,
    items,
    '': 'Meal',
  }
}
