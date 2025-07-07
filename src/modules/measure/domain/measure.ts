import { z } from 'zod'

import {
  createCreatedAtField,
  createIdField,
  createNewTypeField,
  createTargetTimestampField,
  createTypeField,
  createUpdatedAtField,
  createUserIdField,
} from '~/shared/domain/schema/baseSchemas'
import { createNumberField } from '~/shared/domain/schema/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

// TODO:   Create discriminate union type for Male and Female body measures
export const bodyMeasureSchema = z
  .object({
    id: createIdField(),
    userId: createUserIdField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
    target_timestamp: createTargetTimestampField(),
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
  .strip()

export type BodyMeasure = Readonly<z.infer<typeof bodyMeasureSchema>>
export type NewBodyMeasure = Readonly<z.infer<typeof newBodyMeasureSchema>>
export type NewBodyMeasureProps = Omit<
  NewBodyMeasure,
  '__type' | 'createdAt' | 'updatedAt'
>

export function createNewBodyMeasure(
  bodyMeasure: NewBodyMeasureProps,
): NewBodyMeasure {
  const now = new Date()
  return parseWithStack(newBodyMeasureSchema, {
    ...bodyMeasure,
    createdAt: now,
    updatedAt: now,
    __type: 'new-NewBodyMeasure',
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
    __type: 'new-NewBodyMeasure',
  })
}
