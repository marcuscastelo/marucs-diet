import type { z } from 'zod'

import {
  createNewTypeField,
  createTypeField,
  entityBaseSchema,
  ownedEntityBaseSchema,
  timestampedEntityBaseSchema,
} from '~/shared/domain/schema/baseSchemas'
import { createNumberField } from '~/shared/domain/schema/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

// TODO:   Create discriminate union type for Male and Female body measures
export const bodyMeasureSchema = entityBaseSchema
  .merge(ownedEntityBaseSchema)
  .merge(timestampedEntityBaseSchema)
  .extend({
    height: createNumberField('height'),
    waist: createNumberField('waist'),
    hip: createNumberField('hip')
      .nullish()
      .transform((v) => (v === null ? undefined : v)),
    neck: createNumberField('neck'),
    __type: createTypeField('BodyMeasure'),
  })
  .strip()

export const newBodyMeasureSchema = bodyMeasureSchema
  .omit({ id: true, __type: true })
  .extend({
    __type: createNewTypeField('NewBodyMeasure'),
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
