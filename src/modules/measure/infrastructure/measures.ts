import supabase from '~/legacy/utils/supabase'
import { type Measure, type NewMeasure } from '~/modules/measure/domain/measure'
import { type MeasureRepository } from '~/modules/measure/domain/measureRepository'
import {
  createInsertMeasureDAOFromNewMeasure,
  createMeasureFromDAO,
  createUpdateMeasureDAOFromNewMeasure,
  measureDAOSchema,
} from '~/modules/measure/infrastructure/measureDAO'
import { type User } from '~/modules/user/domain/user'
import { handleApiError, wrapErrorWithStack } from '~/shared/error/errorHandler'
import { parseWithStack } from '~/shared/utils/parseWithStack'

const TABLE = 'body_measures'

export function createSupabaseMeasureRepository(): MeasureRepository {
  return {
    fetchUserMeasures,
    insertMeasure,
    updateMeasure,
    deleteMeasure,
  }
}

async function fetchUserMeasures(userId: User['id']) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('owner', userId)
    .order('target_timestamp', { ascending: true })

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseMeasureRepository',
      operation: 'fetchUserMeasures',
      additionalData: { userId },
    })
    throw wrapErrorWithStack(error)
  }

  const measureDAOs = parseWithStack(measureDAOSchema.array(), data)
  return measureDAOs.map(createMeasureFromDAO)
}

async function insertMeasure(newMeasure: NewMeasure): Promise<Measure | null> {
  const createDAO = createInsertMeasureDAOFromNewMeasure(newMeasure)
  const { data, error } = await supabase.from(TABLE).insert(createDAO).select()

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseMeasureRepository',
      operation: 'insertMeasure',
      additionalData: { measure: newMeasure },
    })
    throw wrapErrorWithStack(error)
  }

  const measureDAOs = parseWithStack(measureDAOSchema.array(), data)
  const measures = measureDAOs.map(createMeasureFromDAO)

  return measures[0] ?? null
}

async function updateMeasure(
  measureId: Measure['id'],
  newMeasure: NewMeasure,
): Promise<Measure | null> {
  const updateDAO = createUpdateMeasureDAOFromNewMeasure(newMeasure)
  const { data, error } = await supabase
    .from(TABLE)
    .update(updateDAO)
    .eq('id', measureId)
    .select()

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseMeasureRepository',
      operation: 'updateMeasure',
      additionalData: { measureId, measure: newMeasure },
    })
    throw wrapErrorWithStack(error)
  }

  const measureDAOs = parseWithStack(measureDAOSchema.array(), data)
  const measures = measureDAOs.map(createMeasureFromDAO)

  return measures[0] ?? null
}

async function deleteMeasure(id: Measure['id']) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseMeasureRepository',
      operation: 'deleteMeasure',
      additionalData: { id },
    })
    throw wrapErrorWithStack(error)
  }
}
