import toast from 'solid-toast'
import { type Measure, type NewMeasure } from '~/modules/measure/domain/measure'
import { createSupabaseMeasureRepository } from '~/modules/measure/infrastructure/measures'
import { type User } from '~/modules/user/domain/user'

const measureRepository = createSupabaseMeasureRepository()

export async function fetchUserMeasures(userId: User['id']) {
  return await measureRepository.fetchUserMeasures(userId)
}

export async function insertMeasure(newMeasure: NewMeasure) {
  return await toast.promise(measureRepository.insertMeasure(newMeasure), {
    loading: 'Inserindo medidas...',
    success: 'Medidas inseridas com sucesso',
    error: 'Falha ao inserir medidas',
  })
}

export async function updateMeasure(
  measureId: Measure['id'],
  newMeasure: NewMeasure,
) {
  return await toast.promise(
    measureRepository.updateMeasure(measureId, newMeasure),
    {
      loading: 'Atualizando medidas...',
      success: 'Medidas atualizadas com sucesso',
      error: 'Falha ao atualizar medidas',
    },
  )
}

export async function deleteMeasure(measureId: Measure['id']) {
  await toast.promise(measureRepository.deleteMeasure(measureId), {
    loading: 'Deletando medidas...',
    success: 'Medidas deletadas com sucesso',
    error: 'Falha ao deletar medidas',
  })
}
