import { z } from 'zod'
import { macroNutrientsSchema } from './macroNutrientsModel'
import { generateId } from '@/utils/idUtils'

export const foodItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  reference: z.number(),
  quantity: z.number(),
  macros: macroNutrientsSchema,
  '': z
    .string()
    .nullable()
    .optional()
    .transform(() => 'FoodItem' as const),
})

export type FoodItem = z.infer<typeof foodItemSchema>

export function createFoodItem({
  name,
  reference,
  quantity = 0,
  macros = {},
}: {
  name: string
  reference: number
  quantity?: number
  macros?: Partial<FoodItem['macros']>
}) {
  return foodItemSchema.parse({
    '': 'FoodItem',
    id: generateId(), // TODO: Remove id generation from createFoodItem and use it only in the database
    name,
    reference,
    quantity,
    macros: {
      protein: macros.protein ?? 0,
      carbs: macros.carbs ?? 0,
      fat: macros.fat ?? 0,
    },
  } satisfies FoodItem)
}
