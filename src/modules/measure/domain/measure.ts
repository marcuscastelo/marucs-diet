/* eslint-disable camelcase */
import { type DbReady } from '~/legacy/utils/newDbRecord'
import { z } from 'zod'

// TODO: Create discriminate union type for Male and Female measures
export const measureSchema = z.object({
  id: z.number(),
  height: z.number(),
  waist: z.number(),
  hip: z
    .number()
    .nullish()
    .transform((v) => (v === null ? undefined : v)),
  neck: z.number(),
  owner: z.number(),
  target_timestamp: z
    .date()
    .or(z.string())
    .transform((v) => new Date(v)),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Measure' as const),
})

// TODO: rename to BodyMeasure
export type Measure = Readonly<z.infer<typeof measureSchema>>

export function createMeasure({
  owner,
  height,
  waist,
  hip,
  neck,
  target_timestamp: targetTimestamp,
}: DbReady<Measure>): DbReady<Measure> {
  return {
    owner,
    height,
    waist,
    hip,
    neck,
    target_timestamp: targetTimestamp,
  }
}
