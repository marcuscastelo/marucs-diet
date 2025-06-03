import {
  type DayDiet,
  type NewDayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import { type User } from '~/modules/user/domain/user'
import { type Accessor } from 'solid-js'

export type DayRepository = {
  // fetchAllUserDayIndexes: (
  //   userId: User['id'],
  // ) => Promise<Accessor<readonly DayIndex[]>>
  fetchAllUserDayDiets: (
    userId: User['id'],
  ) => Promise<Accessor<readonly DayDiet[]>>
  fetchDayDiet: (dayId: DayDiet['id']) => Promise<DayDiet | null>
  insertDayDiet: (newDay: NewDayDiet) => Promise<DayDiet | null> // TODO: Remove nullability from insertDay
  updateDayDiet: (dayId: DayDiet['id'], newDay: NewDayDiet) => Promise<DayDiet>
  deleteDayDiet: (id: DayDiet['id']) => Promise<void>
}
