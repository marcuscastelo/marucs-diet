import { z } from 'zod'

import {
  createCreatedAtField,
  createIdField,
  createNewTypeField,
  createTargetTimestampField,
  createTypeField,
  createUpdatedAtField,
  createUserIdField,
} from '~/shared/domain/schema/baseSchemas'
import { createNumberField } from '~/shared/domain/schema/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const newWeightSchema = z
  .object({
    userId: createUserIdField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
    target_timestamp: createTargetTimestampField(),
    weight: createNumberField('weight'),
    __type: createNewTypeField('NewWeight'),
  })
  .strip()

export const weightSchema = z
  .object({
    id: createIdField(),
    userId: createUserIdField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
    target_timestamp: createTargetTimestampField(),
    weight: createNumberField('weight'),
    __type: createTypeField('Weight'),
  })
  .strip()

export type NewWeight = Readonly<z.infer<typeof newWeightSchema>>
export type Weight = Readonly<z.infer<typeof weightSchema>>

/**
 * Creates a new NewWeight.
 * Used for initializing new weights before saving to database.
 */
export function createNewWeight({
  userId,
  weight,
  target_timestamp: targetTimestamp,
}: {
  userId: number
  weight: number
  target_timestamp: Date
}): NewWeight {
  const now = new Date()
  return {
    userId,
    weight,
    target_timestamp: targetTimestamp,
    createdAt: now,
    updatedAt: now,
    __type: 'new-NewWeight',
  }
}

/**
 * Promotes a NewWeight to a Weight after persistence.
 */
export function promoteToWeight(newWeight: NewWeight, id: number): Weight {
  return {
    ...newWeight,
    id,
    __type: 'Weight',
  }
}

/**
 * Demotes a Weight to a NewWeight for updates.
 * Used when converting a persisted Weight back to NewWeight for database operations.
 */
export function demoteToNewWeight(weight: Weight): NewWeight {
  return parseWithStack(newWeightSchema, {
    userId: weight.userId,
    weight: weight.weight,
    target_timestamp: weight.target_timestamp,
    createdAt: weight.createdAt,
    updatedAt: weight.updatedAt,
    __type: 'new-NewWeight',
  })
}
