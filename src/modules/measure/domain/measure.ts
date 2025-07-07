import { z } from 'zod'

import {
  createHeightField,
  createHipField,
  createIdField,
  createNeckField,
  createNewTypeField,
  createOwnerField,
  createTargetTimestampField,
  createTypeField,
  createWaistField,
} from '~/shared/domain/commonFields'
import { parseWithStack } from '~/shared/utils/parseWithStack'

// TODO:   Create discriminate union type for Male and Female body measures
export const bodyMeasureSchema = z
  .object({
    id: createIdField('measure'),
    height: createHeightField('measure'),
    waist: createWaistField('measure'),
    hip: createHipField('measure'),
    neck: createNeckField('measure'),
    owner: createOwnerField('measure'),
    target_timestamp: createTargetTimestampField('measure'),
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
