import { z } from 'zod/v4'

import { createZodEntity } from '~/shared/domain/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

const ze = createZodEntity('measure')

// TODO:   Create discriminate union type for Male and Female body measures
export const bodyMeasureSchema = ze
  .create({
    id: ze.number('id'),
    height: ze.number('height'),
    waist: ze.number('waist'),
    hip: ze
      .number('hip')
      .nullish()
      .transform((v) => (v === null ? undefined : v)),
    neck: ze.number('neck'),
    owner: ze.number('owner'),
    target_timestamp: z
      .date()
      .or(z.string())
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
  return parseWithStack(newBodyMeasureSchema, {
    ...bodyMeasure,
    __type: 'NewBodyMeasure',
  })
}
