import { type Measure, measureSchema } from '~/modules/measure/domain/measure'
import { type User } from '~/modules/user/domain/user'
import { type DbReady, enforceDbReady } from '~/legacy/utils/newDbRecord'
import supabase from '~/legacy/utils/supabase'
import { type MeasureRepository } from '~/modules/measure/domain/measureRepository'
import { handleApiError } from '~/shared/error/errorHandler'

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
      additionalData: { userId }
    })
    throw error
  }

  return measureSchema.array().parse(data)
}

async function insertMeasure(newMeasure: DbReady<Measure>) {
  const measure = enforceDbReady(newMeasure)
  const { data, error } = await supabase.from(TABLE).insert(measure).select()

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseMeasureRepository',
      operation: 'insertMeasure',
      additionalData: { measure }
    })
    throw error
  }

  return measureSchema.parse(data?.[0])
}

async function updateMeasure(
  measureId: Measure['id'],
  newMeasure: DbReady<Measure>,
) {
  const measure = enforceDbReady(newMeasure)
  const { data, error } = await supabase
    .from(TABLE)
    .update(measure)
    .eq('id', measureId)
    .select()

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseMeasureRepository',
      operation: 'updateMeasure',
      additionalData: { measureId, measure }
    })
    throw error
  }

  return measureSchema.parse(data?.[0])
}

async function deleteMeasure(id: Measure['id']) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseMeasureRepository',
      operation: 'deleteMeasure',
      additionalData: { id }
    })
    throw error
  }
}
