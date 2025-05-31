/* eslint-disable camelcase */
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

export const newMeasureSchema = measureSchema.omit({ id: true, __type: true })

// TODO: rename to BodyMeasure
export type Measure = Readonly<z.infer<typeof measureSchema>>
export type NewMeasure = Readonly<z.infer<typeof newMeasureSchema>>

export function createNewMeasure({
  owner,
  height,
  waist,
  hip,
  neck,
  target_timestamp,
}: {
  owner: number
  height: number
  waist: number
  hip?: number | null | undefined
  neck: number
  target_timestamp: Date | string
}): NewMeasure {
  return newMeasureSchema.parse({
    owner,
    height,
    waist,
    hip,
    neck,
    target_timestamp,
  })
}

export function promoteToMeasure(newMeasure: NewMeasure, id: number): Measure {
  return measureSchema.parse({
    ...newMeasure,
    id,
  })
}
