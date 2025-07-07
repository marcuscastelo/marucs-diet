import { z } from 'zod/v4'

import { unifiedItemSchema } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import {
  createIdField,
  createItemsField,
  createNameField,
  createTypeField,
} from '~/shared/domain/commonFields'
import { generateId } from '~/shared/utils/idUtils'

export const mealSchema = z.object({
  id: createIdField('meal'),
  name: createNameField('meal'),
  items: createItemsField('meal', unifiedItemSchema),
  __type: createTypeField('Meal' as const),
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
