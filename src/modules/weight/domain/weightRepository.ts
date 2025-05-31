import { type Weight, type NewWeight } from '~/modules/weight/domain/weight'
import { type User } from '~/modules/user/domain/user'

export type WeightRepository = {
  fetchUserWeights: (userId: User['id']) => Promise<readonly Weight[]>
  insertWeight: (newWeight: NewWeight) => Promise<Weight>
  updateWeight: (
    weightId: Weight['id'],
    weight: Weight,
  ) => Promise<Weight>
  deleteWeight: (id: Weight['id']) => Promise<void>
}
