import { z } from 'zod'

import { parseWithStack } from '~/shared/utils/parseWithStack'

// TODO:   Create discriminate union type for Male and Female measures
export const measureSchema = z.object({
  id: z.number({
    required_error: "O campo 'id' da medida é obrigatório.",
    invalid_type_error: "O campo 'id' da medida deve ser um número.",
  }),
  height: z.number({
    required_error: "O campo 'height' da medida é obrigatório.",
    invalid_type_error: "O campo 'height' da medida deve ser um número.",
  }),
  waist: z.number({
    required_error: "O campo 'waist' da medida é obrigatório.",
    invalid_type_error: "O campo 'waist' da medida deve ser um número.",
  }),
  hip: z
    .number({
      required_error: "O campo 'hip' da medida é obrigatório.",
      invalid_type_error: "O campo 'hip' da medida deve ser um número.",
    })
    .nullish()
    .transform((v) => (v === null ? undefined : v)),
  neck: z.number({
    required_error: "O campo 'neck' da medida é obrigatório.",
    invalid_type_error: "O campo 'neck' da medida deve ser um número.",
  }),
  owner: z.number({
    required_error: "O campo 'owner' da medida é obrigatório.",
    invalid_type_error: "O campo 'owner' da medida deve ser um número.",
  }),
  target_timestamp: z
    .date({
      required_error: "O campo 'target_timestamp' da medida é obrigatório.",
      invalid_type_error:
        "O campo 'target_timestamp' da medida deve ser uma data ou string.",
    })
    .or(
      z.string({
        required_error: "O campo 'target_timestamp' da medida é obrigatório.",
        invalid_type_error:
          "O campo 'target_timestamp' da medida deve ser uma data ou string.",
      }),
    )
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
  return parseWithStack(newMeasureSchema, {
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
  return parseWithStack(measureSchema, {
    ...newMeasure,
    id,
  })
}

/**
 * Demotes a Measure to a NewMeasure for updates.
 * Used when converting a persisted Measure back to NewMeasure for database operations.
 */
export function demoteToNewMeasure(measure: Measure): NewMeasure {
  return parseWithStack(newMeasureSchema, {
    height: measure.height,
    waist: measure.waist,
    hip: measure.hip,
    neck: measure.neck,
    owner: measure.owner,
    target_timestamp: measure.target_timestamp,
    __type: 'NewMeasure',
  })
}
