import { type DbReady } from '~/legacy/utils/newDbRecord'
import { type Measure } from '~/modules/measure/domain/measure'
import { createSupabaseMeasureRepository } from '~/modules/measure/infrastructure/measures'
import { type User } from '~/modules/user/domain/user'

const measureRepository = createSupabaseMeasureRepository()

export async function fetchUserMeasures(userId: User['id']) {
  return await measureRepository.fetchUserMeasures(userId)
}

export async function insertMeasure(newMeasure: DbReady<Measure>) {
  return await measureRepository.insertMeasure(newMeasure)
}

export async function updateMeasure(
  measureId: Measure['id'],
  newMeasure: Measure,
) {
  return await measureRepository.updateMeasure(measureId, newMeasure)
}

export async function deleteMeasure(measureId: Measure['id']) {
  await measureRepository.deleteMeasure(measureId)
}
