import { getTodayYYYYMMDD } from '~/shared/utils/date'
import {
  type DayDiet,
  type NewDayDiet,
  createNewDayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import {
  createSupabaseDayRepository,
  SUPABASE_TABLE_DAYS,
} from '~/modules/diet/day-diet/infrastructure/supabaseDayRepository'
import { type User } from '~/modules/user/domain/user'
import { createEffect, createSignal } from 'solid-js'
import { currentUserId } from '~/modules/user/application/user'
import { showPromise } from '~/modules/toast/application/toastManager'
import { registerSubapabaseRealtimeCallback } from '~/legacy/utils/supabase'
import { handleApiError } from '~/shared/error/errorHandler'

export function createDayDiet({
  target_day: targetDay,
  owner,
  meals = [],
}: {
  target_day: string
  owner: number
  meals?: DayDiet['meals']
}): NewDayDiet {
  return createNewDayDiet({
    target_day: targetDay,
    owner,
    meals,
  })
}

const dayRepository = createSupabaseDayRepository()

export const [targetDay, setTargetDay] =
  createSignal<string>(getTodayYYYYMMDD())

export const [dayDiets, setDayDiets] = createSignal<readonly DayDiet[]>([])

export const [currentDayDiet, setCurrentDayDiet] = createSignal<DayDiet | null>(
  null,
)

function bootstrap() {
  void showPromise(
    fetchAllUserDayDiets(currentUserId()),
    {
      loading: 'Carregando dietas do usuário...',
      success: 'Dietas do usuário obtidas com sucesso',
      error: 'Erro ao obter dietas do usuário',
    },
    { context: 'background' },
  )
}

/**
 * When user changes, fetch all day diets for the new user
 */
createEffect(() => {
  bootstrap()
})

/**
 * When realtime day diets change, update day diets for current user
 */
registerSubapabaseRealtimeCallback(SUPABASE_TABLE_DAYS, () => {
  bootstrap()
})

/**
 * When target day changes, update current day diet
 */
createEffect(() => {
  const dayDiet = dayDiets().find(
    (dayDiet) => dayDiet.target_day === targetDay(),
  )

  if (dayDiet === undefined) {
    console.warn(`[dayDiet] No day diet found for ${targetDay()}`)
    setCurrentDayDiet(null)
    return
  }

  setCurrentDayDiet(dayDiet)
})

async function fetchAllUserDayDiets(userId: User['id']) {
  // TODO: Optimize fetching to only get necessary data
  try {
    const newDayDiets = await dayRepository.fetchAllUserDayDiets(userId)
    setDayDiets(newDayDiets)
  } catch (error) {
    handleApiError(error, {
      component: 'dayDietApplication',
      operation: 'fetchAllUserDayDiets',
      additionalData: { userId },
    })
    throw error
  }
}

export async function insertDayDiet(dayDiet: NewDayDiet): Promise<void> {
  try {
    await showPromise(dayRepository.insertDayDiet(dayDiet), {
      loading: 'Criando dia de dieta...',
      success: 'Dia de dieta criado com sucesso',
      error: 'Erro ao criar dia de dieta',
    })
    // Silently refresh data without additional toast noise
    await fetchAllUserDayDiets(dayDiet.owner)
  } catch (error) {
    handleApiError(error, {
      component: 'dayDietApplication',
      operation: 'insertDayDiet',
      additionalData: { owner: dayDiet.owner },
    })
    throw error
  }
}

export async function updateDayDiet(
  dayId: DayDiet['id'],
  dayDiet: NewDayDiet,
): Promise<void> {
  try {
    await showPromise(dayRepository.updateDayDiet(dayId, dayDiet), {
      loading: 'Atualizando dieta...',
      success: 'Dieta atualizada com sucesso',
      error: 'Erro ao atualizar dieta',
    })
    // Silently refresh data without additional toast noise
    await fetchAllUserDayDiets(dayDiet.owner)
  } catch (error) {
    handleApiError(error, {
      component: 'dayDietApplication',
      operation: 'updateDayDiet',
      additionalData: { dayId, owner: dayDiet.owner },
    })
    throw error
  }
}

export async function deleteDayDiet(dayId: DayDiet['id']): Promise<void> {
  try {
    await showPromise(dayRepository.deleteDayDiet(dayId), {
      loading: 'Deletando dieta...',
      success: 'Dieta deletada com sucesso',
      error: 'Erro ao deletar dieta',
    })
    // Silently refresh data without additional toast noise
    await fetchAllUserDayDiets(currentUserId())
  } catch (error) {
    handleApiError(error, {
      component: 'dayDietApplication',
      operation: 'deleteDayDiet',
      additionalData: { dayId },
    })
    throw error
  }
}
