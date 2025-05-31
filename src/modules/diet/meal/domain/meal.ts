import { generateId } from '~/legacy/utils/idUtils'
import { itemGroupSchema } from '~/modules/diet/item-group/domain/itemGroup'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'

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

// Type for creating new meals (without ID)
export const newMealSchema = z.object({
  name: z.string(),
  groups: z.array(itemGroupSchema),
})

export type Meal = Readonly<z.infer<typeof mealSchema>>
export type NewMeal = Readonly<z.infer<typeof newMealSchema>>

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

/**
 * Creates a NewMeal object for meal creation without generating an ID
 */
export function createNewMeal({
  name,
  groups = [],
}: {
  name: string
  groups?: ItemGroup[]
}): NewMeal {
  return newMealSchema.parse({
    name,
    groups,
  })
}
