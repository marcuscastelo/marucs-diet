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
import toast from 'solid-toast'
import { registerSubapabaseRealtimeCallback } from '~/legacy/utils/supabase'
import { formatError } from '~/shared/formatError'

export function createDayDiet({
  targetDay,
  owner,
  meals = [],
}: {
  targetDay: string
  owner: number
  meals?: DayDiet['meals']
}): NewDayDiet {
  return createNewDayDiet({
    targetDay,
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
  toast
    .promise(fetchAllUserDayDiets(currentUserId()), {
      loading: 'Buscando dietas do usuário...',
      success: 'Dietas do usuário obtidas com sucesso',
      error: 'Falha ao buscar dietas do usuário',
    })
    .catch((error) => {
      console.error(error)
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
 * @deprecated Not used. TODO: Clean up dayDiet repository
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
      toast.error(
        `Falha na comunicação com o servidor ao buscar dieta do dia: ${formatError(error)}`,
      )
      console.error(error)
    })
}

// TODO: Stop fetching all day diets
export async function fetchAllUserDayDiets(userId: User['id']) {
  await dayRepository
    .fetchAllUserDayDiets(userId)
    .then((newDayDiets) => {
      setDayDiets(newDayDiets)
    })
    .catch((error) => {
      toast.error(
        `Falha na comunicação com o servidor ao buscar dieta dos dias do usuário: ${formatError(error)}`,
      )

      console.error(error)
    })
}

export async function insertDayDiet(dayDiet: NewDayDiet): Promise<void> {
  await toast
    .promise(dayRepository.insertDayDiet(dayDiet), {
      loading: 'Criando novo dia de dieta...',
      success: 'Dia de dieta criado com sucesso',
      error: 'Falha ao criar novo dia de dieta',
    })
    .then(async () => {
      await fetchAllUserDayDiets(dayDiet.owner) // TODO: Stop fetching all day diets
    })
    .catch((error) => {
      console.error(error)
    })
}

export async function updateDayDiet(
  dayId: DayDiet['id'],
  dayDiet: NewDayDiet,
): Promise<void> {
  await toast
    .promise(dayRepository.updateDayDiet(dayId, dayDiet), {
      loading: 'Atualizando dieta...',
      success: 'Dieta atualizada com sucesso',
      error: 'Falha ao atualizar dieta',
    })
    .then(async () => {
      await fetchAllUserDayDiets(dayDiet.owner) // TODO: Stop fetching all day diets
    })
    .catch((error) => {
      console.error(error)
    })
}

export async function deleteDayDiet(dayId: DayDiet['id']): Promise<void> {
  await toast
    .promise(dayRepository.deleteDayDiet(dayId), {
      loading: 'Deletando dieta...',
      success: 'Dieta deletada com sucesso',
      error: 'Falha ao deletar dieta',
    })
    .then(async () => {
      await fetchAllUserDayDiets(dayId) // TODO: Stop fetching all day diets
    })
    .catch((error) => {
      console.error(error)
    })
}
