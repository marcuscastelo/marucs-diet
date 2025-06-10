import { z } from 'zod'

import {
  type Measure,
  measureSchema,
  type NewMeasure,
} from '~/modules/measure/domain/measure'
import { parseWithStack } from '~/shared/utils/parseWithStack'

// DAO schemas for database operations
export const createMeasureDAOSchema = z.object({
  height: z.number(),
  waist: z.number(),
  hip: z.number().nullish(),
  neck: z.number(),
  owner: z.number(),
  target_timestamp: z.date().or(z.string()),
})

export const measureDAOSchema = createMeasureDAOSchema.extend({
  id: z.number(),
})

export type CreateMeasureDAO = z.infer<typeof createMeasureDAOSchema>
export type MeasureDAO = z.infer<typeof measureDAOSchema>

// Conversion functions
export function createInsertMeasureDAOFromNewMeasure(
  newMeasure: NewMeasure,
): CreateMeasureDAO {
  return {
    height: newMeasure.height,
    waist: newMeasure.waist,
    hip: newMeasure.hip,
    neck: newMeasure.neck,
    owner: newMeasure.owner,
    target_timestamp: newMeasure.target_timestamp,
  }
}

export function createUpdateMeasureDAOFromNewMeasure(
  newMeasure: NewMeasure,
): CreateMeasureDAO {
  return createInsertMeasureDAOFromNewMeasure(newMeasure)
}

export function createMeasureFromDAO(dao: MeasureDAO): Measure {
  return parseWithStack(measureSchema, {
    id: dao.id,
    height: dao.height,
    waist: dao.waist,
    hip: dao.hip === null ? undefined : dao.hip,
    neck: dao.neck,
    owner: dao.owner,
    target_timestamp: new Date(dao.target_timestamp),
  })
}
