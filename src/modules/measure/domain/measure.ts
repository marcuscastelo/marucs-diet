/* eslint-disable camelcase */
import { z } from 'zod'

// TODO:   Create discriminate union type for Male and Female measures
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

export const newMeasureSchema = measureSchema
  .omit({ id: true, __type: true })
  .extend({
    __type: z.literal('NewMeasure'),
  })

// TODO:   rename to BodyMeasure
export type Measure = Readonly<z.infer<typeof measureSchema>>
export type NewMeasure = Readonly<z.infer<typeof newMeasureSchema>>

export function createNewMeasure({
  owner,
  height,
  waist,
  hip,
  neck,
  targetTimestamp,
}: {
  owner: number
  height: number
  waist: number
  hip?: number | null | undefined
  neck: number
  targetTimestamp: Date | string
}): NewMeasure {
  return newMeasureSchema.parse({
    owner,
    height,
    waist,
    hip,
    neck,
    target_timestamp: targetTimestamp,
    __type: 'NewMeasure',
  })
}

export function promoteToMeasure(newMeasure: NewMeasure, id: number): Measure {
  return measureSchema.parse({
    ...newMeasure,
    id,
  })
}

/**
 * Demotes a Measure to a NewMeasure for updates.
 * Used when converting a persisted Measure back to NewMeasure for database operations.
 */
export function demoteToNewMeasure(measure: Measure): NewMeasure {
  return newMeasureSchema.parse({
    height: measure.height,
    waist: measure.waist,
    hip: measure.hip,
    neck: measure.neck,
    owner: measure.owner,
    target_timestamp: measure.target_timestamp,
    __type: 'NewMeasure',
  })
}
