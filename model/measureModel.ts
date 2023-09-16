/* eslint-disable camelcase */
import { New } from '@/utils/newDbRecord'
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

export type Measure = z.infer<typeof measureSchema>

export function createMeasure({
  owner,
  height,
  waist,
  hip,
  neck,
  target_timestamp,
}: New<Measure>): New<Measure> {
  return {
    owner,
    height,
    waist,
    hip,
    neck,
    target_timestamp,
  }
}
