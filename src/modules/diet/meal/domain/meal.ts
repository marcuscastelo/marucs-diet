import { z } from 'zod'

import { unifiedItemSchema } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { generateId } from '~/shared/utils/idUtils'

export const mealSchema = z.object({
  id: z.number(),
  name: z.string(),
  items: z.array(unifiedItemSchema),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Meal' as const),
})

export type Meal = Readonly<z.infer<typeof mealSchema>>

export function createMeal({
  name,
  items,
}: {
  name: string
  items: Meal['items']
}): Meal {
  return {
    id: generateId(),
    name,
    items,
    __type: 'Meal',
  }
}
