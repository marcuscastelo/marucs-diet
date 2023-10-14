import { User } from '@/model/userModel'
import { Weight, weigthSchema as weightSchema } from '@/model/weightModel'
import { DbReady, enforceDbReady } from '@/utils/newDbRecord'
import supabase from '@/utils/supabase'

const TABLE = 'weights'

export async function fetchUserWeights(userId: User['id']) {
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

export async function insertWeight(newWeight: DbReady<Weight>) {
  const weight = enforceDbReady(newWeight)
  const { data, error } = await supabase.from(TABLE).insert(weight).select()

  if (error) {
    console.error(error)
    throw error
  }

  return weightSchema.parse(data?.[0])
}

export async function updateWeight(
  weightId: Weight['id'],
  newWeight: DbReady<Weight>,
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

export async function deleteWeight(id: Weight['id']) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)

  if (error) {
    console.error(error)
    throw error
  }
}
