import { generateId } from '~/legacy/utils/idUtils'
import { itemGroupSchema } from '~/modules/diet/item-group/domain/itemGroup'

import { z } from 'zod'

export const mealSchema = z.object({
  id: z.number(),
  name: z.string(),
  groups: z.array(itemGroupSchema),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Meal' as const),
})

export type Meal = Readonly<z.infer<typeof mealSchema>>

export function createMeal({
  name,
  groups,
}: {
  name: string
  groups: Meal['groups']
}): Meal {
  return {
    id: generateId(),
    name,
    groups,
    __type: 'Meal',
  }
}
