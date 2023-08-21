/* eslint-disable camelcase */
import { New } from '@/utils/newDbRecord'
import { z } from 'zod'

export const weigthSchema = z.object({
  id: z.number(),
  owner: z.number(),
  weight: z.number(),
  target_timestamp: z
    .date()
    .or(z.string())
    .transform((v) => new Date(v)),
  '': z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Weight' as const),
})

export type Weight = z.infer<typeof weigthSchema>

export function createWeight({
  owner,
  weight,
  target_timestamp,
}: New<Weight>): New<Weight> {
  return {
    owner,
    weight,
    target_timestamp,
  }
}
