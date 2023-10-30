import { Weight } from '@/modules/weight/domain/weight'
import { User } from '@/modules/user/domain/user'
import { DbReady } from '@/legacy/utils/newDbRecord'

export interface WeightRepository {
  fetchUserWeights(userId: User['id']): Promise<readonly Weight[]>
  insertWeight(newWeight: DbReady<Weight>): Promise<Weight>
  updateWeight(
    weightId: Weight['id'],
    newWeight: DbReady<Weight>,
  ): Promise<Weight>
  deleteWeight(id: Weight['id']): Promise<void>
}
