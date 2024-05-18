import { type New, enforceNew } from '~/legacy/utils/newDbRecord'
import { getTodayYYYMMDD } from '~/legacy/utils/dateUtils'
import {
  type DayDiet,
  dayDietSchema,
} from '~/modules/diet/day-diet/domain/dayDiet'
import { createSupabaseDayRepository } from '~/modules/diet/day-diet/infrastructure/supabaseDayRepository'
import { type User } from '~/modules/user/domain/user'
import { createEffect, createSignal } from 'solid-js'
import { currentUserId } from '~/modules/user/application/user'
import toast from 'solid-toast'

export function createDayDiet({
  target_day: targetDay,
  owner,
  meals = [],
}: {
  target_day: string
  owner: number
  meals?: DayDiet['meals']
}): New<DayDiet> {
  return enforceNew(
    dayDietSchema.parse({
      id: 0,
      target_day: targetDay,
      owner,
      meals,
      __type: 'DayDiet',
    } satisfies DayDiet),
  )
}

const dayRepository = createSupabaseDayRepository()

export const [targetDay, setTargetDay] = createSignal<string>(getTodayYYYMMDD())

export const [dayDiets, setDayDiets] = createSignal<readonly DayDiet[]>([])

export const [currentDayDiet, setCurrentDayDiet] = createSignal<DayDiet | null>(
  null,
)

createEffect(() => {
  toast
    .promise(fetchAllUserDayDiets(currentUserId()), {
      loading: 'Buscando dietas do usuário...',
      success: 'Dietas do usuário obtidas com sucesso',
      error: 'Falha ao buscar dietas do usuário',
    })
    .catch((error) => {
      console.error(error)
    })
})

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

export async function refetchCurrentDayDiet() {
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
        'Falha na comunicação com o servidor ao buscar dieta do dia: \n' +
          JSON.stringify(error, null, 2),
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
        'Falha na comunicação com o servidor ao buscar dieta dos dias do usuário',
      )
      console.error(error)
    })
}

export async function insertDayDiet(dayDiet: New<DayDiet>): Promise<void> {
  await toast
    .promise(dayRepository.insertDayDiet(enforceNew(dayDiet)), {
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
  dayDiet: DayDiet,
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
