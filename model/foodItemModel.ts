import { foodSchema } from './foodModel'

import { z } from 'zod'

export const foodItemSchema = z.object({
  id: z.number(),
  food: foodSchema,
  quantity: z.number(),
})

// TODO: rename MealItem component to FoodItemView
export type FoodItem = z.infer<typeof foodItemSchema>
