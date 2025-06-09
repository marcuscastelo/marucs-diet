import { z } from 'zod'

import { type Weight, weightSchema } from '~/modules/weight/domain/weight'

// Base schema (with ID)
export const weightDAOSchema = z.object({
  id: z.number(),
  owner: z.number(),
  weight: z.number(),
  target_timestamp: z
    .date()
    .or(z.string())
    .transform((v) => new Date(v)),
})

// Schema for creation (without ID)
export const createWeightDAOSchema = weightDAOSchema.omit({ id: true })

// Schema for update (optional fields, without ID)
export const updateWeightDAOSchema = weightDAOSchema
  .omit({ id: true })
  .partial()

// Types
export type WeightDAO = z.infer<typeof weightDAOSchema>
export type CreateWeightDAO = z.infer<typeof createWeightDAOSchema>
export type UpdateWeightDAO = z.infer<typeof updateWeightDAOSchema>

// Conversions
export function createWeightDAO(weight: Weight): WeightDAO {
  return weightDAOSchema.parse({
    id: weight.id,
    owner: weight.owner,
    weight: weight.weight,
    target_timestamp: weight.target_timestamp,
  })
}

export function createWeightFromDAO(dao: WeightDAO): Weight {
  return weightSchema.parse({
    ...dao,
  })
}

export function createInsertWeightDAOFromWeight(
  weight: Omit<Weight, 'id' | '__type'>,
): CreateWeightDAO {
  return createWeightDAOSchema.parse({
    owner: weight.owner,
    weight: weight.weight,
    target_timestamp: weight.target_timestamp,
  })
}

export function createUpdateWeightDAOFromWeight(
  weight: Weight,
): UpdateWeightDAO {
  return updateWeightDAOSchema.parse({
    owner: weight.owner,
    weight: weight.weight,
    target_timestamp: weight.target_timestamp,
  })
}
