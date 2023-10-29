import { New, enforceNew } from '@/legacy/utils/newDbRecord'
import { getToday } from '@/src/legacy/utils/dateUtils'
import {
  DayDiet,
  DayIndex,
  dayDietSchema,
} from '@/src/modules/diet/day-diet/domain/dayDiet'
import { createSupabaseDayRepository } from '@/src/modules/diet/day-diet/infrastructure/supabaseDayRepository'
import { User } from '@/src/modules/user/domain/user'
import { computed, effect, signal } from '@preact/signals-react'

const dayRepository = createSupabaseDayRepository()

const dayIndexes_ = signal<readonly DayIndex[]>([])
const dayDiets_ = signal<readonly DayDiet[]>([])
const currentDayDiet_ = signal<DayDiet | null>(null)

export const dayIndexes = computed(() => dayIndexes_.value)
export const dayDiets = computed(() => dayDiets_.value)
export const currentDayDiet = computed(() => currentDayDiet_.value)

export const targetDay = signal<string>(getToday())
effect(() => {
  const dayIndex = dayIndexes_.value.find(
    (dayIndex) => dayIndex.target_day === targetDay.value,
  )

  if (dayIndex === undefined) {
    currentDayDiet_.value = null
    return
  }

  fetchCurrentDay(dayIndex.id)
})

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

export async function fetchDayIndexes(userId: User['id']) {
  dayIndexes_.value = (await dayRepository.fetchAllUserDayIndexes(userId)).value
}

export function fetchCurrentDay(dayId: DayDiet['id']) {
  dayRepository.fetchDayDiet(dayId).then((dayDiet) => {
    currentDayDiet_.value = dayDiet
  })
}

// TODO: Stop fetching all day diets
export function fetchDayDiets(userId: User['id']) {
  dayRepository.fetchAllUserDayDiets(userId).then((dayDiets) => {
    dayDiets_.value = dayDiets.value
    fetchDayIndexes(userId)
  })
}

export function insertDayDiet(dayDiet: New<DayDiet>): void {
  dayRepository.insertDayDiet(enforceNew(dayDiet)).then(() => {
    fetchDayDiets(dayDiet.owner) // TODO: Stop fetching all day diets
  })
}

export function updateDayDiet(dayId: DayDiet['id'], dayDiet: DayDiet): void {
  dayRepository.updateDayDiet(dayId, dayDiet).then(() => {
    fetchDayDiets(dayDiet.owner) // TODO: Stop fetching all day diets
  })
}

export function deleteDayDiet(dayId: DayDiet['id']): void {
  dayRepository.deleteDayDiet(dayId).then(() => {
    fetchDayDiets(dayId) // TODO: Stop fetching all day diets
  })
}
