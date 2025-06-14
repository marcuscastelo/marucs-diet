import { createEffect, createSignal } from 'solid-js'

import {
  createNewDayDiet,
  type DayDiet,
  type NewDayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import {
  createSupabaseDayRepository,
  SUPABASE_TABLE_DAYS,
} from '~/modules/diet/day-diet/infrastructure/supabaseDayRepository'
import { showPromise } from '~/modules/toast/application/toastManager'
import { currentUserId } from '~/modules/user/application/user'
import { type User } from '~/modules/user/domain/user'
import { handleApiError } from '~/shared/error/errorHandler'
import { getTodayYYYYMMDD } from '~/shared/utils/date'
import { registerSubapabaseRealtimeCallback } from '~/shared/utils/supabase'

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

async function fetchAllUserDayDiets(userId: User['id']): Promise<void> {
  try {
    const newDayDiets = await dayRepository.fetchAllUserDayDiets(userId)
    setDayDiets(newDayDiets)
  } catch (error) {
    handleApiError(error, {
      component: 'dayDietApplication',
      operation: 'fetchAllUserDayDiets',
      additionalData: { userId },
    })
    setDayDiets([])
  }
}

/**
 * Inserts a new day diet.
 * @param dayDiet - The new day diet data.
 * @returns True if inserted, false otherwise.
 */
export async function insertDayDiet(dayDiet: NewDayDiet): Promise<boolean> {
  try {
    await showPromise(
      dayRepository.insertDayDiet(dayDiet),
      {
        loading: 'Criando dia de dieta...',
        success: 'Dia de dieta criado com sucesso',
        error: 'Erro ao criar dia de dieta',
      },
      { context: 'user-action', audience: 'user' },
    )
    await fetchAllUserDayDiets(dayDiet.owner)
    return true
  } catch (error) {
    handleApiError(error, {
      component: 'dayDietApplication',
      operation: 'insertDayDiet',
      additionalData: { owner: dayDiet.owner },
    })
    return false
  }
}

/**
 * Updates a day diet by ID.
 * @param dayId - The day diet ID.
 * @param dayDiet - The new day diet data.
 * @returns True if updated, false otherwise.
 */
export async function updateDayDiet(
  dayId: DayDiet['id'],
  dayDiet: NewDayDiet,
): Promise<boolean> {
  try {
    await showPromise(
      dayRepository.updateDayDiet(dayId, dayDiet),
      {
        loading: 'Atualizando dieta...',
        success: 'Dieta atualizada com sucesso',
        error: 'Erro ao atualizar dieta',
      },
      { context: 'user-action', audience: 'user' },
    )
    await fetchAllUserDayDiets(dayDiet.owner)
    return true
  } catch (error) {
    handleApiError(error, {
      component: 'dayDietApplication',
      operation: 'updateDayDiet',
      additionalData: { dayId, owner: dayDiet.owner },
    })
    return false
  }
}

/**
 * Deletes a day diet by ID.
 * @param dayId - The day diet ID.
 * @returns True if deleted, false otherwise.
 */
export async function deleteDayDiet(dayId: DayDiet['id']): Promise<boolean> {
  try {
    await showPromise(
      dayRepository.deleteDayDiet(dayId),
      {
        loading: 'Deletando dieta...',
        success: 'Dieta deletada com sucesso',
        error: 'Erro ao deletar dieta',
      },
      { context: 'user-action', audience: 'user' },
    )
    await fetchAllUserDayDiets(currentUserId())
    return true
  } catch (error) {
    handleApiError(error, {
      component: 'dayDietApplication',
      operation: 'deleteDayDiet',
      additionalData: { dayId },
    })
    return false
  }
}

/**
 * Returns all previous DayDiet objects before the given target day, ordered by descending date.
 *
 * @param dayDiets - List of all DayDiet objects (should be sorted ascending by date)
 * @param selectedDay - The YYYY-MM-DD string to compare against
 * @returns Array of DayDiet objects before selectedDay, ordered by descending date
 */
export function getPreviousDayDiets(
  dayDiets: readonly DayDiet[],
  selectedDay: string,
): DayDiet[] {
  return dayDiets
    .filter(
      (day) =>
        new Date(day.target_day).getTime() < new Date(selectedDay).getTime(),
    )
    .sort(
      (a, b) =>
        new Date(b.target_day).getTime() - new Date(a.target_day).getTime(),
    )
}
