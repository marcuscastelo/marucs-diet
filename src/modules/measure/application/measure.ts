import { type Measure, type NewMeasure } from '~/modules/measure/domain/measure'
import { createSupabaseMeasureRepository } from '~/modules/measure/infrastructure/measures'
import { showPromise } from '~/modules/toast/application/toastManager'
import { type User } from '~/modules/user/domain/user'
import { handleApiError } from '~/shared/error/errorHandler'

const measureRepository = createSupabaseMeasureRepository()

/**
 * Fetches all measures for a user.
 * @param userId - The user ID.
 * @returns Array of measures or empty array on error.
 */
export async function fetchUserMeasures(
  userId: User['id'],
): Promise<readonly Measure[]> {
  try {
    return await measureRepository.fetchUserMeasures(userId)
  } catch (error) {
    handleApiError(error, {
      component: 'measureApplication',
      operation: 'fetchUserMeasures',
      additionalData: { userId },
    })
    return []
  }
}

/**
 * Inserts a new measure.
 * @param newMeasure - The new measure data.
 * @returns The inserted measure or null on error.
 */
export async function insertMeasure(
  newMeasure: NewMeasure,
): Promise<Measure | null> {
  try {
    return await showPromise(
      measureRepository.insertMeasure(newMeasure),
      {
        loading: 'Inserindo medidas...',
        success: 'Medidas inseridas com sucesso',
        error: 'Falha ao inserir medidas',
      },
      { context: 'user-action', audience: 'user' },
    )
  } catch (error) {
    handleApiError(error, {
      component: 'measureApplication',
      operation: 'insertMeasure',
      additionalData: { newMeasure },
    })
    return null
  }
}

/**
 * Updates a measure by ID.
 * @param measureId - The measure ID.
 * @param newMeasure - The new measure data.
 * @returns The updated measure or null on error.
 */
export async function updateMeasure(
  measureId: Measure['id'],
  newMeasure: NewMeasure,
): Promise<Measure | null> {
  try {
    return await showPromise(
      measureRepository.updateMeasure(measureId, newMeasure),
      {
        loading: 'Atualizando medidas...',
        success: 'Medidas atualizadas com sucesso',
        error: 'Falha ao atualizar medidas',
      },
      { context: 'user-action', audience: 'user' },
    )
  } catch (error) {
    handleApiError(error, {
      component: 'measureApplication',
      operation: 'updateMeasure',
      additionalData: { measureId, newMeasure },
    })
    return null
  }
}

/**
 * Deletes a measure by ID.
 * @param measureId - The measure ID.
 * @returns True if deleted, false otherwise.
 */
export async function deleteMeasure(
  measureId: Measure['id'],
): Promise<boolean> {
  try {
    await showPromise(
      measureRepository.deleteMeasure(measureId),
      {
        loading: 'Deletando medidas...',
        success: 'Medidas deletadas com sucesso',
        error: 'Falha ao deletar medidas',
      },
      { context: 'user-action', audience: 'user' },
    )
    return true
  } catch (error) {
    handleApiError(error, {
      component: 'measureApplication',
      operation: 'deleteMeasure',
      additionalData: { measureId },
    })
    return false
  }
}
