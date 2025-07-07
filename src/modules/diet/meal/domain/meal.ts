import { z } from 'zod/v4'

import { unifiedItemSchema } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import {
  createArrayFieldMessages,
  createNumberFieldMessages,
  createStringFieldMessages,
} from '~/shared/domain/validationMessages'
import { generateId } from '~/shared/utils/idUtils'

export const mealSchema = z.object({
  id: z.number(createNumberFieldMessages('id')('meal')),
  name: z.string(createStringFieldMessages('name')('meal')),
  items: z.array(unifiedItemSchema, createArrayFieldMessages('items')('meal')),
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
