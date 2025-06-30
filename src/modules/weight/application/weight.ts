import { createResource } from 'solid-js'

import { showPromise } from '~/modules/toast/application/toastManager'
import { currentUserId } from '~/modules/user/application/user'
import { type NewWeight, type Weight } from '~/modules/weight/domain/weight'
import {
  createSupabaseWeightRepository,
  SUPABASE_TABLE_WEIGHTS,
} from '~/modules/weight/infrastructure/supabaseWeightRepository'
import { handleApiError } from '~/shared/error/errorHandler'
import { registerSubapabaseRealtimeCallback } from '~/shared/utils/supabase'

const weightRepository = createSupabaseWeightRepository()

/**
 * Lazy-loading resource for user weights
 * Automatically fetches when accessed and currentUserId changes
 */
export const [
  userWeights,
  { mutate: mutateUserWeights, refetch: refetchUserWeights },
] = createResource(
  currentUserId, // Source signal - refetches when userId changes
  async (userId: number) => {
    try {
      return await weightRepository.fetchUserWeights(userId)
    } catch (error) {
      handleApiError(error)
      throw error
    }
  },
)

/**
 * When a realtime event occurs, refetch user weights
 */
registerSubapabaseRealtimeCallback(SUPABASE_TABLE_WEIGHTS, () => {
  void refetchUserWeights()
})

export async function insertWeight(newWeight: NewWeight) {
  try {
    const weight = await weightRepository.insertWeight(newWeight)
    await showPromise(Promise.resolve(refetchUserWeights()), {
      loading: 'Inserindo peso...',
      success: 'Peso inserido com sucesso',
      error: 'Falha ao inserir peso',
    })
    return weight
  } catch (error) {
    handleApiError(error)
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
    void refetchUserWeights()
    return weight
  } catch (error) {
    handleApiError(error)
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
    void refetchUserWeights()
  } catch (error) {
    handleApiError(error)
    throw error
  }
}
