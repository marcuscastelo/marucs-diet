import { z } from 'zod'
import { MacroNutrientsSchema as macroNutrientsSchema } from './macroNutrientsModel'

export const itemSchema = z.object({
  id: z.number(),
  name: z.string(),
  reference: z.number(),
  quantity: z.number(),
  macros: macroNutrientsSchema,
  // TODO: Nominally typed string
  // '': z
  //   .string()
  //   .nullable()
  //   .optional()
  //   .transform(() => 'FoodItem' as const),
})

// TODO: rename MealItem component to FoodItemView
export type FoodItem = z.infer<typeof itemSchema>
