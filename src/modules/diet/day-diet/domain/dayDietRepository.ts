import { DayDiet, DayIndex } from '@/modules/diet/day-diet/domain/dayDiet'
import { User } from '@/modules/user/domain/user'
import { DbReady } from '@/legacy/utils/newDbRecord'
import { ReadonlySignal } from '@preact/signals-react'

export interface DayRepository {
  fetchAllUserDayIndexes(
    userId: User['id'],
  ): Promise<ReadonlySignal<readonly DayIndex[]>>
  fetchAllUserDayDiets(
    userId: User['id'],
  ): Promise<ReadonlySignal<readonly DayDiet[]>>
  fetchDayDiet(dayId: DayDiet['id']): Promise<DayDiet | null>
  insertDayDiet(newDay: DbReady<DayDiet>): Promise<DayDiet | null> // TODO: Remove nullability from insertDay
  updateDayDiet(
    dayId: DayDiet['id'],
    newDay: DbReady<DayDiet>,
  ): Promise<DayDiet>
  deleteDayDiet(id: DayDiet['id']): Promise<void>
}
