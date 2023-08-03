import { foodItemSchema } from './foodItemModel'

import { z } from 'zod'

export const mealSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: z.array(foodItemSchema),
})

// TODO: rename MealData to Meal (and Meal component to MealView)
export type MealData = z.infer<typeof mealSchema>
