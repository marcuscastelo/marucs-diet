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
import {
  smartToastPromise,
  smartToastPromiseDetached,
  showError,
} from '~/shared/toast'
import { registerSubapabaseRealtimeCallback } from '~/legacy/utils/supabase'
import { formatError } from '~/shared/formatError'
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
  smartToastPromiseDetached(fetchAllUserDayDiets(currentUserId()), {
    context: 'background',
    loading: 'Buscando dietas do usuário...',
    success: 'Dietas do usuário obtidas com sucesso',
    error: 'Falha ao buscar dietas do usuário',
  })
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

/**
 * @deprecated Not used. TODO:   Clean up dayDiet repository
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export async function __unused_refetchCurrentDayDiet() {
  const currentDayDiet_ = currentDayDiet()
  if (currentDayDiet_ === null) {
    return
  }

  await dayRepository
    .fetchDayDiet(currentDayDiet_.id)
    .then((dayDiet) => {
      setCurrentDayDiet(dayDiet)
    })
    .catch((error) => {
      showError(
        `Falha na comunicação com o servidor ao buscar dieta do dia: ${formatError(error)}`,
        'background',
      )
      console.error(error)
    })
}

async function fetchAllUserDayDiets(userId: User['id']) {
  // TODO: Optimize fetching to only get necessary data
  try {
    const newDayDiets = await dayRepository.fetchAllUserDayDiets(userId)
    setDayDiets(newDayDiets)
  } catch (error) {
    showError(
      `Falha na comunicação com o servidor ao buscar dieta dos dias do usuário: ${formatError(error)}`,
      'background',
    )
    handleApiError(error, {
      component: 'dayDietApplication',
      operation: 'fetchAllUserDayDiets',
      additionalData: { userId },
    })
  }
}

export async function insertDayDiet(dayDiet: NewDayDiet): Promise<void> {
  try {
    await smartToastPromise(dayRepository.insertDayDiet(dayDiet), {
      context: 'user-action',
      loading: 'Criando novo dia de dieta...',
      success: 'Dia de dieta criado com sucesso',
      error: 'Falha ao criar novo dia de dieta',
    })
    await smartToastPromise(fetchAllUserDayDiets(dayDiet.owner), {
      context: 'background',
      loading: 'Atualizando lista de dietas...',
      success: 'Lista de dietas atualizada',
      error: 'Falha ao atualizar lista de dietas',
    })
  } catch (error) {
    handleApiError(error, {
      component: 'dayDietApplication',
      operation: 'insertDayDiet',
      additionalData: { owner: dayDiet.owner },
    })
  }
}

export async function updateDayDiet(
  dayId: DayDiet['id'],
  dayDiet: NewDayDiet,
): Promise<void> {
  try {
    await smartToastPromise(dayRepository.updateDayDiet(dayId, dayDiet), {
      context: 'user-action',
      loading: 'Atualizando dieta...',
      success: 'Dieta atualizada com sucesso',
      error: 'Falha ao atualizar dieta',
    })
    await smartToastPromise(fetchAllUserDayDiets(dayDiet.owner), {
      context: 'background',
      loading: 'Atualizando lista de dietas...',
      success: 'Lista de dietas atualizada',
      error: 'Falha ao atualizar lista de dietas',
    })
  } catch (error) {
    handleApiError(error, {
      component: 'dayDietApplication',
      operation: 'updateDayDiet',
      additionalData: { dayId, owner: dayDiet.owner },
    })
  }
}

export async function deleteDayDiet(dayId: DayDiet['id']): Promise<void> {
  try {
    await smartToastPromise(dayRepository.deleteDayDiet(dayId), {
      context: 'user-action',
      loading: 'Deletando dieta...',
      success: 'Dieta deletada com sucesso',
      error: 'Falha ao deletar dieta',
    })
    await smartToastPromise(fetchAllUserDayDiets(dayId), {
      context: 'background',
      loading: 'Atualizando lista de dietas...',
      success: 'Lista de dietas atualizada',
      error: 'Falha ao atualizar lista de dietas',
    })
  } catch (error) {
    handleApiError(error, {
      component: 'dayDietApplication',
      operation: 'deleteDayDiet',
      additionalData: { dayId },
    })
  }
}
