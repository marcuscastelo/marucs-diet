import { Day } from '@/modules/diet/day/domain/day'
import { User } from '@/modules/user/domain/user'
import { DbReady } from '@/src/legacy/utils/newDbRecord'

export interface DayRepository {
  fetchUserDays(userId: User['id']): Promise<readonly Day[]>
  insertDay(newDay: DbReady<Day>): Promise<Day | null> // TODO: Remove nullability from insertDay
  updateDay(dayId: Day['id'], newDay: DbReady<Day>): Promise<Day>
  deleteDay(id: Day['id']): Promise<void>
}
