import { z } from 'zod/v4'

import { createZodEntity } from '~/shared/domain/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

const ze = createZodEntity('weight')

export const newWeightSchema = ze.create({
  owner: ze.number(),
  weight: ze.number(),
  target_timestamp: z
    .date()
    .or(z.string())
    .transform((v) => new Date(v)),
  __type: z.literal('NewWeight'),
})

export const weightSchema = ze.create({
  id: ze.number(),
  owner: ze.number(),
  weight: ze.number(),
  target_timestamp: z
    .date()
    .or(z.string())
    .transform((v) => new Date(v)),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Weight' as const),
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
