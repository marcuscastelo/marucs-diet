import { z } from 'zod'
import { MacroNutrientsSchema as macroNutrientsSchema } from './macroNutrientsModel'

export const itemSchema = z.object({
  id: z.number(),
  reference: z.number(),
  quantity: z.number(),
  macros: macroNutrientsSchema,
})

// TODO: rename MealItem component to FoodItemView
export type FoodItem = z.infer<typeof itemSchema>
