import { type z } from 'zod/v4'

import { unifiedItemSchema } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { createZodEntity } from '~/shared/domain/validation'

const ze = createZodEntity('Meal')

export const {
  schema: mealSchema,
  newSchema: newMealSchema,
  createNew: createNewMeal,
  promote: promoteMeal,
  demote: demoteMeal,
} = ze.create({
  name: ze.string(),
  items: ze.array(unifiedItemSchema),
})

export type NewMeal = Readonly<z.infer<typeof newMealSchema>>
export type Meal = Readonly<z.infer<typeof mealSchema>>
