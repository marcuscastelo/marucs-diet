/* eslint-disable camelcase */
import { type DbReady } from '@/legacy/utils/newDbRecord'
import { z } from 'zod'

export const weigthSchema = z.object({
  id: z.number(),
  owner: z.number(),
  weight: z.number(),
  target_timestamp: z
    .date()
    .or(z.string())
    .transform((v) => new Date(v)),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Weight' as const)
})

export type Weight = Readonly<z.infer<typeof weigthSchema>>

export function createWeight ({
  owner,
  weight,
  target_timestamp: targetTimestamp
}: DbReady<Weight>): DbReady<Weight> {
  return {
    owner,
    weight,
    target_timestamp: targetTimestamp
  }
}
