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
  fetchAllUserDayDiets(currentUserId())
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

export function refetchCurrentDayDiet() {
  const currentDayDiet_ = currentDayDiet()
  if (currentDayDiet_ === null) {
    return
  }

  dayRepository
    .fetchDayDiet(currentDayDiet_.id)
    .then((dayDiet) => {
      setCurrentDayDiet(dayDiet)
    })
    .catch((error) => {
      console.error(error)
    })
}

// TODO: Stop fetching all day diets
export function fetchAllUserDayDiets(userId: User['id']) {
  dayRepository
    .fetchAllUserDayDiets(userId)
    .then(async (dayDiets) => {
      setDayDiets(dayDiets)
    })
    .catch((error) => {
      console.error(error)
    })
}

export function insertDayDiet(dayDiet: New<DayDiet>): void {
  dayRepository
    .insertDayDiet(enforceNew(dayDiet))
    .then(() => {
      fetchAllUserDayDiets(dayDiet.owner) // TODO: Stop fetching all day diets
    })
    .catch((error) => {
      console.error(error)
    })
}

export function updateDayDiet(dayId: DayDiet['id'], dayDiet: DayDiet): void {
  dayRepository
    .updateDayDiet(dayId, dayDiet)
    .then(() => {
      fetchAllUserDayDiets(dayDiet.owner) // TODO: Stop fetching all day diets
    })
    .catch((error) => {
      console.error(error)
    })
}

export function deleteDayDiet(dayId: DayDiet['id']): void {
  dayRepository
    .deleteDayDiet(dayId)
    .then(() => {
      fetchAllUserDayDiets(dayId) // TODO: Stop fetching all day diets
    })
    .catch((error) => {
      console.error(error)
    })
}
