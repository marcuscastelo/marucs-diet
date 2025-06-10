import { z } from 'zod'

import { parseWithStack } from '~/shared/utils/parseWithStack'

export const newWeightSchema = z.object({
  owner: z.number({
    required_error: "O campo 'owner' do peso é obrigatório.",
    invalid_type_error: "O campo 'owner' do peso deve ser um número.",
  }),
  weight: z.number({
    required_error: "O campo 'weight' é obrigatório.",
    invalid_type_error: "O campo 'weight' deve ser um número.",
  }),
  target_timestamp: z
    .date({
      required_error: "O campo 'target_timestamp' é obrigatório.",
      invalid_type_error:
        "O campo 'target_timestamp' deve ser uma data ou string.",
    })
    .or(
      z.string({
        required_error: "O campo 'target_timestamp' é obrigatório.",
        invalid_type_error:
          "O campo 'target_timestamp' deve ser uma data ou string.",
      }),
    )
    .transform((v) => new Date(v)),
  __type: z.literal('NewWeight'),
})

export const weightSchema = z.object({
  id: z.number({
    required_error: "O campo 'id' do peso é obrigatório.",
    invalid_type_error: "O campo 'id' do peso deve ser um número.",
  }),
  owner: z.number({
    required_error: "O campo 'owner' do peso é obrigatório.",
    invalid_type_error: "O campo 'owner' do peso deve ser um número.",
  }),
  weight: z.number({
    required_error: "O campo 'weight' é obrigatório.",
    invalid_type_error: "O campo 'weight' deve ser um número.",
  }),
  target_timestamp: z
    .date({
      required_error: "O campo 'target_timestamp' é obrigatório.",
      invalid_type_error:
        "O campo 'target_timestamp' deve ser uma data ou string.",
    })
    .or(
      z.string({
        required_error: "O campo 'target_timestamp' é obrigatório.",
        invalid_type_error:
          "O campo 'target_timestamp' deve ser uma data ou string.",
      }),
    )
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
