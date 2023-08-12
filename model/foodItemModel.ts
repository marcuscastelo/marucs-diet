import { z } from 'zod'
import { macroNutrientsSchema as macroNutrientsSchema } from './macroNutrientsModel'

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

export function createFoodItem({
  name,
  reference,
}: {
  name: string
  reference: number
}) {
  return itemSchema.parse({
    id: Math.round(Math.random() * 100000), // TODO: Module for generating unique ids
    name,
    reference,
    quantity: 0,
    macros: {
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  } satisfies FoodItem)
}
