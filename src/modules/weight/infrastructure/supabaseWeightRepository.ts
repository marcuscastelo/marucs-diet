import { type User } from '@/modules/user/domain/user'
import {
  type Weight,
  weigthSchema as weightSchema
} from '@/modules/weight/domain/weight'
import { type DbReady, enforceDbReady } from '@/legacy/utils/newDbRecord'
import supabase from '@/legacy/utils/supabase'
import { type WeightRepository } from '@/modules/weight/domain/weightRepository'

const TABLE = 'weights'

export function createSupabaseWeightRepository (): WeightRepository {
  return {
    fetchUserWeights,
    insertWeight,
    updateWeight,
    deleteWeight
  }
}

async function fetchUserWeights (userId: User['id']) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('owner', userId)
    .order('target_timestamp', { ascending: true })

  if (error) {
    console.error(error)
    throw error
  }

  return weightSchema.array().parse(data)
}

async function insertWeight (newWeight: DbReady<Weight>) {
  const weight = enforceDbReady(newWeight)
  const { data, error } = await supabase.from(TABLE).insert(weight).select()

  if (error) {
    console.error(error)
    throw error
  }

  return weightSchema.parse(data?.[0])
}

async function updateWeight (
  weightId: Weight['id'],
  newWeight: DbReady<Weight>
) {
  const weight = enforceDbReady(newWeight)
  const { data, error } = await supabase
    .from(TABLE)
    .update(weight)
    .eq('id', weightId)
    .select()

  if (error) {
    console.error(error)
    throw error
  }

  return weightSchema.parse(data?.[0])
}

async function deleteWeight (id: Weight['id']) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)

  if (error) {
    console.error(error)
    throw error
  }
}
