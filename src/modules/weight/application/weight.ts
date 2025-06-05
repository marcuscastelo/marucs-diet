import { currentUserId } from '~/modules/user/application/user'
import { type Weight, type NewWeight } from '~/modules/weight/domain/weight'
import {
  createSupabaseWeightRepository,
  SUPABASE_TABLE_WEIGHTS,
} from '~/modules/weight/infrastructure/supabaseWeightRepository'
import { createEffect, createSignal } from 'solid-js'
import { smartToastPromise, smartToastPromiseDetached } from '~/shared/toast'
import { registerSubapabaseRealtimeCallback } from '~/legacy/utils/supabase'

const weightRepository = createSupabaseWeightRepository()

const [userWeights_, setUserWeights] = createSignal<readonly Weight[]>([])
export const userWeights = () => userWeights_()

function bootstrap() {
  smartToastPromiseDetached(fetchUserWeights(currentUserId()), {
    context: 'background',
    loading: 'Carregando pesos...',
    success: 'Pesos carregados com sucesso',
    error: 'Falha ao carregar pesos',
  })
}

/**
 * Every time the user changes, fetch all user weights
 */
createEffect(() => {
  bootstrap()
})

/**
 * When a realtime event occurs, fetch all user weights again
 */
registerSubapabaseRealtimeCallback(SUPABASE_TABLE_WEIGHTS, () => {
  bootstrap()
})

export async function fetchUserWeights(userId: number) {
  const weights = await weightRepository.fetchUserWeights(userId)
  setUserWeights(weights)
  return weights
}

export async function insertWeight(newWeight: NewWeight) {
  const weight = await weightRepository.insertWeight(newWeight)
  await smartToastPromise(fetchUserWeights(currentUserId()), {
    context: 'user-action',
    loading: 'Inserindo peso...',
    success: 'Peso inserido com sucesso',
    error: 'Falha ao inserir peso',
  })
  return weight
}

export async function updateWeight(weightId: Weight['id'], newWeight: Weight) {
  const weight = await smartToastPromise(
    weightRepository.updateWeight(weightId, newWeight),
    {
      context: 'user-action',
      loading: 'Atualizando peso...',
      success: 'Peso atualizado com sucesso',
      error: 'Falha ao atualizar peso',
    },
  )
  await fetchUserWeights(currentUserId())
  return weight
}

export async function deleteWeight(weightId: Weight['id']) {
  await smartToastPromise(weightRepository.deleteWeight(weightId), {
    context: 'user-action',
    loading: 'Deletando peso...',
    success: 'Peso deletado com sucesso',
    error: 'Falha ao deletar peso',
  })
  await fetchUserWeights(currentUserId())
}
