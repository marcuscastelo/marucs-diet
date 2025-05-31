import { currentUserId } from '~/modules/user/application/user'
import { type Weight, type NewWeight } from '~/modules/weight/domain/weight'
import {
  createSupabaseWeightRepository,
  SUPABASE_TABLE_WEIGHTS,
} from '~/modules/weight/infrastructure/supabaseWeightRepository'
import { createEffect, createSignal } from 'solid-js'
import toast from 'solid-toast'
import { registerSubapabaseRealtimeCallback } from '~/legacy/utils/supabase'

const weightRepository = createSupabaseWeightRepository()

const [userWeights_, setUserWeights] = createSignal<readonly Weight[]>([])
export const userWeights = () => userWeights_()

async function bootstrap() {
  await toast.promise(fetchUserWeights(currentUserId()), {
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
  await toast.promise(fetchUserWeights(currentUserId()), {
    loading: 'Inserindo peso...',
    success: 'Peso inserido com sucesso',
    error: 'Falha ao inserir peso',
  })
  return weight
}

export async function updateWeight(weightId: Weight['id'], newWeight: Weight) {
  const weight = await toast.promise(
    weightRepository.updateWeight(weightId, newWeight),
    {
      loading: 'Atualizando peso...',
      success: 'Peso atualizado com sucesso',
      error: 'Falha ao atualizar peso',
    },
  )
  await fetchUserWeights(currentUserId())
  return weight
}

export async function deleteWeight(weightId: Weight['id']) {
  await toast.promise(weightRepository.deleteWeight(weightId), {
    loading: 'Deletando peso...',
    success: 'Peso deletado com sucesso',
    error: 'Falha ao deletar peso',
  })
  await fetchUserWeights(currentUserId())
}
