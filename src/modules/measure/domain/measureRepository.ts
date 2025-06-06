import { type User } from '~/modules/user/domain/user'
import { type Measure, type NewMeasure } from '~/modules/measure/domain/measure'

export type MeasureRepository = {
  fetchUserMeasures: (userId: User['id']) => Promise<readonly Measure[]>
  insertMeasure: (newMeasure: NewMeasure) => Promise<Measure | null>
  updateMeasure: (
    measureId: Measure['id'],
    newMeasure: NewMeasure,
  ) => Promise<Measure | null>
  deleteMeasure: (id: Measure['id']) => Promise<void>
}
