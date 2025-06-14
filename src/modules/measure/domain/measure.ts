import { z } from 'zod'

import { parseWithStack } from '~/shared/utils/parseWithStack'

// TODO:   Create discriminate union type for Male and Female body measures
export const bodyMeasureSchema = z.object({
  id: z.number({
    required_error: "O campo 'id' da medida corporal é obrigatório.",
    invalid_type_error: "O campo 'id' da medida corporal deve ser um número.",
  }),
  height: z.number({
    required_error: "O campo 'height' da medida corporal é obrigatório.",
    invalid_type_error:
      "O campo 'height' da medida corporal deve ser um número.",
  }),
  waist: z.number({
    required_error: "O campo 'waist' da medida corporal é obrigatório.",
    invalid_type_error:
      "O campo 'waist' da medida corporal deve ser um número.",
  }),
  hip: z
    .number({
      required_error: "O campo 'hip' da medida corporal é obrigatório.",
      invalid_type_error:
        "O campo 'hip' da medida corporal deve ser um número.",
    })
    .nullish()
    .transform((v) => (v === null ? undefined : v)),
  neck: z.number({
    required_error: "O campo 'neck' da medida corporal é obrigatório.",
    invalid_type_error: "O campo 'neck' da medida corporal deve ser um número.",
  }),
  owner: z.number({
    required_error: "O campo 'owner' da medida corporal é obrigatório.",
    invalid_type_error:
      "O campo 'owner' da medida corporal deve ser um número.",
  }),
  target_timestamp: z
    .date({
      required_error:
        "O campo 'target_timestamp' da medida corporal é obrigatório.",
      invalid_type_error:
        "O campo 'target_timestamp' da medida corporal deve ser uma data ou string.",
    })
    .or(
      z.string({
        required_error:
          "O campo 'target_timestamp' da medida corporal é obrigatório.",
        invalid_type_error:
          "O campo 'target_timestamp' da medida corporal deve ser uma data ou string.",
      }),
    )
    .transform((v) => new Date(v)),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'BodyMeasure' as const),
})

export const newBodyMeasureSchema = bodyMeasureSchema
  .omit({ id: true, __type: true })
  .extend({
    __type: z.literal('NewBodyMeasure'),
  })

export type BodyMeasure = Readonly<z.infer<typeof bodyMeasureSchema>>
export type NewBodyMeasure = Readonly<z.infer<typeof newBodyMeasureSchema>>

export function createNewBodyMeasure({
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
}): NewBodyMeasure {
  return parseWithStack(newBodyMeasureSchema, {
    owner,
    height,
    waist,
    hip,
    neck,
    target_timestamp: targetTimestamp,
    __type: 'NewBodyMeasure',
  })
}

export function promoteToBodyMeasure(
  newBodyMeasure: NewBodyMeasure,
  id: number,
): BodyMeasure {
  return parseWithStack(bodyMeasureSchema, {
    ...newBodyMeasure,
    id,
  })
}

/**
 * Demotes a BodyMeasure to a NewBodyMeasure for updates.
 * Used when converting a persisted BodyMeasure back to NewBodyMeasure for database operations.
 */
export function demoteToNewBodyMeasure(
  bodyMeasure: BodyMeasure,
): NewBodyMeasure {
  return parseWithStack(newBodyMeasureSchema, {
    height: bodyMeasure.height,
    waist: bodyMeasure.waist,
    hip: bodyMeasure.hip,
    neck: bodyMeasure.neck,
    owner: bodyMeasure.owner,
    target_timestamp: bodyMeasure.target_timestamp,
    __type: 'NewBodyMeasure',
  })
}
