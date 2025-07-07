import { z } from 'zod'

import { unifiedItemSchema } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import {
  createTypeField,
  entityBaseSchema,
  namedEntityBaseSchema,
} from '~/shared/domain/schema/baseSchemas'
import { generateId } from '~/shared/utils/idUtils'

export const mealSchema = entityBaseSchema.merge(namedEntityBaseSchema).extend({
  items: z.array(unifiedItemSchema),
  __type: createTypeField('Meal'),
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
