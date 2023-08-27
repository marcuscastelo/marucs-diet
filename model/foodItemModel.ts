import { z } from 'zod'
import { macroNutrientsSchema } from './macroNutrientsModel'
import { generateId } from '@/utils/idUtils'

export const foodItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  reference: z.number(),
  quantity: z.number(),
  macros: macroNutrientsSchema,
  // '': z
  //   .string()
  //   .nullable()
  //   .optional()
  //   .transform(() => 'FoodItem' as const),
})

export type FoodItem = z.infer<typeof foodItemSchema>

export function createFoodItem({
  name,
  reference,
}: {
  name: string
  reference: number
}) {
  return foodItemSchema.parse({
    id: generateId(),
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
