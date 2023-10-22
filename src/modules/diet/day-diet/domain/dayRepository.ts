import { DayDiet } from '@/modules/diet/day-diet/domain/day'
import { User } from '@/modules/user/domain/user'
import { DbReady } from '@/src/legacy/utils/newDbRecord'
import { ReadonlySignal } from '@preact/signals-react'

export interface DayRepository {
  fetchUserDays(userId: User['id']): Promise<ReadonlySignal<readonly DayDiet[]>>
  insertDay(newDay: DbReady<DayDiet>): Promise<DayDiet | null> // TODO: Remove nullability from insertDay
  updateDay(dayId: DayDiet['id'], newDay: DbReady<DayDiet>): Promise<DayDiet>
  deleteDay(id: DayDiet['id']): Promise<void>
}
