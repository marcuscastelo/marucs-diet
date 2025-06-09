import { type Measure, type NewMeasure } from '~/modules/measure/domain/measure'
import { createSupabaseMeasureRepository } from '~/modules/measure/infrastructure/measures'
import { showPromise } from '~/modules/toast/application/toastManager'
import { type User } from '~/modules/user/domain/user'
import { handleApiError } from '~/shared/error/errorHandler'

const measureRepository = createSupabaseMeasureRepository()

export async function fetchUserMeasures(userId: User['id']) {
  return await measureRepository.fetchUserMeasures(userId)
}

export async function insertMeasure(newMeasure: NewMeasure) {
  try {
    return await showPromise(measureRepository.insertMeasure(newMeasure), {
      loading: 'Inserindo medidas...',
      success: 'Medidas inseridas com sucesso',
      error: 'Falha ao inserir medidas',
    })
  } catch (error) {
    handleApiError(error, {
      component: 'measureApplication',
      operation: 'insertMeasure',
      additionalData: { newMeasure },
    })
    throw error
  }
}

export async function updateMeasure(
  measureId: Measure['id'],
  newMeasure: NewMeasure,
) {
  try {
    return await showPromise(
      measureRepository.updateMeasure(measureId, newMeasure),
      {
        loading: 'Atualizando medidas...',
        success: 'Medidas atualizadas com sucesso',
        error: 'Falha ao atualizar medidas',
      },
    )
  } catch (error) {
    handleApiError(error, {
      component: 'measureApplication',
      operation: 'updateMeasure',
      additionalData: { measureId, newMeasure },
    })
    throw error
  }
}

export async function deleteMeasure(measureId: Measure['id']) {
  try {
    await showPromise(measureRepository.deleteMeasure(measureId), {
      loading: 'Deletando medidas...',
      success: 'Medidas deletadas com sucesso',
      error: 'Falha ao deletar medidas',
    })
  } catch (error) {
    handleApiError(error, {
      component: 'measureApplication',
      operation: 'deleteMeasure',
      additionalData: { measureId },
    })
    throw error
  }
}
