import { z } from 'zod'

import {
  createIdField,
  createNewTypeField,
  createOwnerField,
  createTargetTimestampField,
  createTypeField,
  createWeightField,
} from '~/shared/domain/commonFields'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const newWeightSchema = z.object({
  owner: createOwnerField('weight'),
  weight: createWeightField('weight'),
  target_timestamp: createTargetTimestampField('weight'),
  __type: createNewTypeField('NewWeight'),
})

export const weightSchema = z.object({
  id: createIdField('weight'),
  owner: createOwnerField('weight'),
  weight: createWeightField('weight'),
  target_timestamp: createTargetTimestampField('weight'),
  __type: createTypeField('Weight'),
})

export type NewWeight = Readonly<z.infer<typeof newWeightSchema>>
export type Weight = Readonly<z.infer<typeof weightSchema>>

/**
 * Creates a new NewWeight.
 * Used for initializing new weights before saving to database.
 */
export function createNewWeight({
  owner,
  weight,
  target_timestamp: targetTimestamp,
}: {
  owner: number
  weight: number
  target_timestamp: Date
}): NewWeight {
  return {
    owner,
    weight,
    target_timestamp: targetTimestamp,
    __type: 'NewWeight',
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
    owner: weight.owner,
    weight: weight.weight,
    target_timestamp: weight.target_timestamp,
    __type: 'NewWeight',
  })
}
