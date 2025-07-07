import { z } from 'zod/v4'

import { createZodEntity } from '~/shared/domain/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

const ze = createZodEntity('measure')

// TODO:   Create discriminate union type for Male and Female body measures
export const bodyMeasureSchema = z
  .object({
    id: z.number(createNumberFieldMessages('id')('measure')),
    height: z.number(createNumberFieldMessages('height')('measure')),
    waist: z.number(createNumberFieldMessages('waist')('measure')),
    hip: z
      .number(createNumberFieldMessages('hip')('measure'))
      .nullish()
      .transform((v) => (v === null ? undefined : v)),
    neck: z.number(createNumberFieldMessages('neck')('measure')),
    owner: z.number(createNumberFieldMessages('owner')('measure')),
    target_timestamp: z
      .date(createDateFieldMessages('target_timestamp')('measure'))
      .or(z.string(createStringFieldMessages('target_timestamp')('measure')))
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
