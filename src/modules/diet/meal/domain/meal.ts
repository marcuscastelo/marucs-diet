import { z } from 'zod'

import { unifiedItemSchema } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import {
  createCreatedAtField,
  createDescriptionField,
  createIdField,
  createTypeField,
  createUpdatedAtField,
  createUserIdField,
} from '~/shared/domain/schema/baseSchemas'
import { createStringField } from '~/shared/domain/schema/validationMessages'
import { generateId } from '~/shared/utils/idUtils'

export const mealSchema = z
  .object({
    id: createIdField(),
    userId: createUserIdField(),
    name: createStringField('name'),
    description: createDescriptionField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
    items: z.array(unifiedItemSchema),
    __type: createTypeField('Meal'),
  })
  .strip()

export type Meal = Readonly<z.infer<typeof mealSchema>>

export function createMeal({
  userId,
  name,
  description = null,
  items,
}: {
  userId: number
  name: string
  description?: string | null
  items: Meal['items']
}): Meal {
  const now = new Date()
  return {
    id: generateId(),
    userId,
    name,
    description,
    createdAt: now,
    updatedAt: now,
    items,
    __type: 'Meal',
  }
}
