import { type z } from 'zod/v4'

import { unifiedItemSchema } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { createZodEntity } from '~/shared/domain/validationMessages'

const ze = createZodEntity('meal')

export const {
  schema: mealSchema,
  createNew: createNewMeal,
  promote: promoteMeal,
} = ze.create({
  id: ze.number(),
  name: ze.string(),
  items: ze.array(unifiedItemSchema),
})

export type Meal = Readonly<z.infer<typeof mealSchema>>
