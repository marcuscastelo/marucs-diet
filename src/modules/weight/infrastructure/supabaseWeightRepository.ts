import { type User } from '~/modules/user/domain/user'
import { type Weight, weightSchema } from '~/modules/weight/domain/weight'
import { type DbReady, enforceDbReady } from '~/legacy/utils/newDbRecord'
import supabase from '~/legacy/utils/supabase'
import { type WeightRepository } from '~/modules/weight/domain/weightRepository'

export const SUPABASE_TABLE_WEIGHTS = 'weights'

export function createSupabaseWeightRepository(): WeightRepository {
  return {
    fetchUserWeights,
    insertWeight,
    updateWeight,
    deleteWeight,
  }
}

async function fetchUserWeights(userId: User['id']) {
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_WEIGHTS)
    .select('*')
    .eq('owner', userId)
    .order('target_timestamp', { ascending: true })

  if (error !== null) {
    console.error(error)
    throw error
  }

  return weightSchema.array().parse(data)
}

async function insertWeight(newWeight: DbReady<Weight>) {
  const weight = enforceDbReady(newWeight)
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_WEIGHTS)
    .insert(weight)
    .select()

  if (error !== null) {
    console.error(error)
    throw error
  }

  return weightSchema.parse(data?.[0])
}

async function updateWeight(
  weightId: Weight['id'],
  newWeight: DbReady<Weight>,
) {
  const weight = enforceDbReady(newWeight)
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_WEIGHTS)
    .update(weight)
    .eq('id', weightId)
    .select()

  if (error !== null) {
    console.error(error)
    throw error
  }

  return weightSchema.parse(data?.[0])
}

async function deleteWeight(id: Weight['id']) {
  const { error } = await supabase
    .from(SUPABASE_TABLE_WEIGHTS)
    .delete()
    .eq('id', id)

  if (error !== null) {
    console.error(error)
    throw error
  }
}
