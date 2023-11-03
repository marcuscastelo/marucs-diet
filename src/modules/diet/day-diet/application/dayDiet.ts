import { type New, enforceNew } from '@/legacy/utils/newDbRecord'
import { getToday } from '@/legacy/utils/dateUtils'
import {
  type DayDiet,
  type DayIndex,
  dayDietSchema
} from '@/modules/diet/day-diet/domain/dayDiet'
import { createSupabaseDayRepository } from '@/modules/diet/day-diet/infrastructure/supabaseDayRepository'
import { type User } from '@/modules/user/domain/user'
import { createEffect, createSignal } from 'solid-js'

const dayRepository = createSupabaseDayRepository()

export const [dayIndexes, setDayIndexes] = createSignal<readonly DayIndex[]>([])
export const [dayDiets, setDayDiets] = createSignal<readonly DayDiet[]>([])
export const [currentDayDiet, setCurrentDayDiet] = createSignal<DayDiet | null>(null)

export const [targetDay, setTargetDay] = createSignal<string>(getToday())
createEffect(() => {
  const dayIndex = dayIndexes().find(
    (dayIndex) => dayIndex.target_day === targetDay()
  )

  if (dayIndex === undefined) {
    setCurrentDayDiet(null)
    return
  }

  fetchDayAsCurrent(dayIndex.id)
})

export function createDayDiet ({
  target_day: targetDay,
  owner,
  meals = []
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
      __type: 'DayDiet'
    } satisfies DayDiet)
  )
}

export async function fetchDayIndexes (userId: User['id']) {
  const dayIndexes = await dayRepository.fetchAllUserDayIndexes(userId)
  setDayIndexes(dayIndexes())
}

export function fetchDayAsCurrent (dayId: DayDiet['id']) {
  dayRepository.fetchDayDiet(dayId).then((dayDiet) => {
    setCurrentDayDiet(dayDiet)
  }).catch((error) => {
    console.error(error)
  })
}

export function refetchCurrentDayDiet () {
  const currentDayDiet_ = currentDayDiet()
  if (currentDayDiet_ === null) {
    return
  }

  fetchDayAsCurrent(currentDayDiet_.id)
}

// TODO: Stop fetching all day diets
export function fetchDayDiets (userId: User['id']) {
  dayRepository.fetchAllUserDayDiets(userId).then(async (dayDiets) => {
    setDayDiets(dayDiets)
    await fetchDayIndexes(userId)
  }).catch((error) => {
    console.error(error)
  })
}

export function insertDayDiet (dayDiet: New<DayDiet>): void {
  dayRepository.insertDayDiet(enforceNew(dayDiet)).then(() => {
    fetchDayDiets(dayDiet.owner) // TODO: Stop fetching all day diets
  }).catch((error) => {
    console.error(error)
  })
}

export function updateDayDiet (dayId: DayDiet['id'], dayDiet: DayDiet): void {
  dayRepository.updateDayDiet(dayId, dayDiet).then(() => {
    fetchDayDiets(dayDiet.owner) // TODO: Stop fetching all day diets
  }).catch((error) => {
    console.error(error)
  })
}

export function deleteDayDiet (dayId: DayDiet['id']): void {
  dayRepository.deleteDayDiet(dayId).then(() => {
    fetchDayDiets(dayId) // TODO: Stop fetching all day diets
  }).catch((error) => {
    console.error(error)
  })
}
