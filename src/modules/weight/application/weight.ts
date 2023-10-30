// import { type DbReady } from '@/legacy/utils/newDbRecord'
// import { type Weight } from '@/modules/weight/domain/weight'
// import { createSupabaseWeightRepository } from '@/modules/weight/infrastructure/supabaseWeightRepository'

// const weightRepository = createSupabaseWeightRepository()

// const userWeights_ = signal<readonly Weight[]>([])
// export const userWeights = computed(() => userWeights_.value)

// export async function fetchUserWeights (userId: number) {
//   const weights = await weightRepository.fetchUserWeights(userId)
//   userWeights_.value = weights
//   return weights
// }

// export async function insertWeight (newWeight: DbReady<Weight>) {
//   const weight = await weightRepository.insertWeight(newWeight)
//   if (weight.owner === userWeights_.value[0].owner) {
//     fetchUserWeights(weight.owner)
//   }
//   return weight
// }

// export async function updateWeight (weightId: Weight['id'], newWeight: Weight) {
//   const weight = await weightRepository.updateWeight(weightId, newWeight)
//   if (weight.owner === userWeights_.value[0].owner) {
//     fetchUserWeights(weight.owner)
//   }
//   return weight
// }

// export async function deleteWeight (weightId: Weight['id']) {
//   await weightRepository.deleteWeight(weightId)
//   if (userWeights_.value.length > 0) {
//     fetchUserWeights(userWeights_.value[0].owner)
//   }
// }
