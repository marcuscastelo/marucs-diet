import { type User } from '~/modules/user/domain/user'
import { type DbReady } from '~/legacy/utils/newDbRecord'
import { type Measure } from '~/modules/measure/domain/measure'

export type MeasureRepository = {
  fetchUserMeasures: (userId: User['id']) => Promise<readonly Measure[]>
  insertMeasure: (newMeasure: DbReady<Measure>) => Promise<Measure>
  updateMeasure: (
    measureId: Measure['id'],
    newMeasure: DbReady<Measure>,
  ) => Promise<Measure>
  deleteMeasure: (id: Measure['id']) => Promise<void>
}
