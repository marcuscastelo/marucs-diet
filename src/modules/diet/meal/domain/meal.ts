import { z } from 'zod/v4'

import { unifiedItemSchema } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { createZodEntity } from '~/shared/domain/validationMessages'
import { generateId } from '~/shared/utils/idUtils'

const ze = createZodEntity('meal')

export const mealSchema = ze.create({
  id: ze.number('id'),
  name: ze.string('name'),
  items: ze.array('items', unifiedItemSchema),
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
