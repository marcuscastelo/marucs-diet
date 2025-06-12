import { createEffect, createSignal } from 'solid-js'

import { registerSubapabaseRealtimeCallback } from '~/legacy/utils/supabase'
import { showPromise } from '~/modules/toast/application/toastManager'
import { currentUserId } from '~/modules/user/application/user'
import { type NewWeight, type Weight } from '~/modules/weight/domain/weight'
import {
  createSupabaseWeightRepository,
  SUPABASE_TABLE_WEIGHTS,
} from '~/modules/weight/infrastructure/supabaseWeightRepository'
import { handleApiError } from '~/shared/error/errorHandler'

const weightRepository = createSupabaseWeightRepository()

const [userWeights_, setUserWeights] = createSignal<readonly Weight[]>([])
export const userWeights = () => userWeights_()

function bootstrap() {
  void showPromise(
    fetchUserWeights(currentUserId()),
    {
      loading: 'Carregando pesos...',
      success: 'Pesos carregados com sucesso',
      error: 'Falha ao carregar pesos',
    },
    { context: 'background' },
  )
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
  try {
    const weights = await weightRepository.fetchUserWeights(userId)
    setUserWeights(weights)
    return weights
  } catch (error) {
    handleApiError(error, {
      component: 'weightApplication',
      operation: 'fetchUserWeights',
      additionalData: { userId },
    })
    throw error
  }
}

export async function insertWeight(newWeight: NewWeight) {
  try {
    const weight = await weightRepository.insertWeight(newWeight)
    await showPromise(fetchUserWeights(currentUserId()), {
      loading: 'Inserindo peso...',
      success: 'Peso inserido com sucesso',
      error: 'Falha ao inserir peso',
    })
    return weight
  } catch (error) {
    handleApiError(error, {
      component: 'weightApplication',
      operation: 'insertWeight',
      additionalData: { newWeight },
    })
    throw error
  }
}

export async function updateWeight(weightId: Weight['id'], newWeight: Weight) {
  try {
    const weight = await showPromise(
      weightRepository.updateWeight(weightId, newWeight),
      {
        loading: 'Atualizando peso...',
        success: 'Peso atualizado com sucesso',
        error: 'Falha ao atualizar peso',
      },
    )
    await fetchUserWeights(currentUserId())
    return weight
  } catch (error) {
    handleApiError(error, {
      component: 'weightApplication',
      operation: 'updateWeight',
      additionalData: { weightId, newWeight },
    })
    throw error
  }
}

export async function deleteWeight(weightId: Weight['id']) {
  try {
    await showPromise(weightRepository.deleteWeight(weightId), {
      loading: 'Deletando peso...',
      success: 'Peso deletado com sucesso',
      error: 'Falha ao deletar peso',
    })
    await fetchUserWeights(currentUserId())
  } catch (error) {
    handleApiError(error, {
      component: 'weightApplication',
      operation: 'deleteWeight',
      additionalData: { weightId },
    })
    throw error
  }
}
