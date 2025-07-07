import { z } from 'zod'

import {
  type BodyMeasure,
  bodyMeasureSchema,
  type NewBodyMeasure,
} from '~/modules/measure/domain/measure'
import { parseWithStack } from '~/shared/utils/parseWithStack'

// DAO schemas for database operations
export const createBodyMeasureDAOSchema = z.object({
  height: z.number(),
  waist: z.number(),
  hip: z.number().nullish(),
  neck: z.number(),
  owner: z.number(),
  target_timestamp: z.date().or(z.string()),
})

export const bodyMeasureDAOSchema = createBodyMeasureDAOSchema.extend({
  id: z.number(),
})

export type CreateBodyMeasureDAO = z.infer<typeof createBodyMeasureDAOSchema>
export type BodyMeasureDAO = z.infer<typeof bodyMeasureDAOSchema>

// Conversion functions
export function createInsertBodyMeasureDAOFromNewBodyMeasure(
  newBodyMeasure: NewBodyMeasure,
): CreateBodyMeasureDAO {
  return {
    height: newBodyMeasure.height,
    waist: newBodyMeasure.waist,
    hip: newBodyMeasure.hip,
    neck: newBodyMeasure.neck,
    owner: newBodyMeasure.userId,
    target_timestamp: newBodyMeasure.target_timestamp,
  }
}

export function createUpdateBodyMeasureDAOFromNewBodyMeasure(
  newBodyMeasure: NewBodyMeasure,
): CreateBodyMeasureDAO {
  return createInsertBodyMeasureDAOFromNewBodyMeasure(newBodyMeasure)
}

export function createBodyMeasureFromDAO(dao: BodyMeasureDAO): BodyMeasure {
  return parseWithStack(bodyMeasureSchema, {
    id: dao.id,
    height: dao.height,
    waist: dao.waist,
    hip: dao.hip === null ? undefined : dao.hip,
    neck: dao.neck,
    owner: dao.owner,
    target_timestamp: new Date(dao.target_timestamp),
  })
}
