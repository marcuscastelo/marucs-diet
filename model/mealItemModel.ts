import { foodSchema } from './foodModel'

import { z } from 'zod'

export const mealItemSchema = z.object({
  id: z.number(),
  food: foodSchema,
  quantity: z.number(),
})

export type MealItemData = z.infer<typeof mealItemSchema>
export type MealItemAddData = Omit<MealItemData, 'id' | 'mealId'>
export type MealItemEditData = MealItemData
