import { z } from 'zod'

import { parseWithStack } from '~/shared/utils/parseWithStack'

// TODO:   Create discriminate union type for Male and Female body measures
export const bodyMeasureSchema = z
  .object({
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
      invalid_type_error:
        "O campo 'neck' da medida corporal deve ser um número.",
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
  .strip()

export const newBodyMeasureSchema = bodyMeasureSchema
  .omit({ id: true, __type: true })
  .extend({
    __type: z.literal('NewBodyMeasure'),
  })
  .strict()

export type BodyMeasure = Readonly<z.infer<typeof bodyMeasureSchema>>
export type NewBodyMeasure = Readonly<z.infer<typeof newBodyMeasureSchema>>
export type NewBodyMeasureProps = Omit<NewBodyMeasure, '__type'>

export function createNewBodyMeasure(
  bodyMeasure: NewBodyMeasureProps,
): NewBodyMeasure {
  return parseWithStack(newBodyMeasureSchema, {
    ...bodyMeasure,
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

export function demoteToNewBodyMeasure(
  bodyMeasure: BodyMeasure,
): NewBodyMeasure {
  const { id: _id, ...bodyMeasureWithoutId } = bodyMeasure
  return parseWithStack(newBodyMeasureSchema, {
    ...bodyMeasureWithoutId,
    __type: 'NewBodyMeasure',
  })
}
