import { z } from 'zod'
import { MacroNutrientsSchema as macroNutrientsSchema } from './macroNutrientsModel'

export const itemSchema = z.object({
  id: z.number(),
  // TODO: Remove food.id and use reference instead
  food: z
    .object({
      id: z.number(),
    })
    .optional(),
  reference: z.number(),
  type: z.union([z.literal('food'), z.literal('recipe')]),
  quantity: z.number(),
  macros: macroNutrientsSchema,
})

// TODO: rename MealItem component to FoodItemView
export type FoodItem = z.infer<typeof itemSchema>
