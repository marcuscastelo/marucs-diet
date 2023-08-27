import { generateId } from '@/utils/idUtils'
import { itemGroupSchema } from './itemGroupModel'

import { z } from 'zod'

export const mealSchema = z.object({
  id: z.number(),
  name: z.string(),
  groups: z.array(itemGroupSchema),
  '': z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Meal' as const),
})

export type Meal = z.infer<typeof mealSchema>

// TODO: Create factory function for other models
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
    '': 'Meal',
  }
}
