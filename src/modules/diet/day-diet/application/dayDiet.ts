import { New, enforceNew } from '@/legacy/utils/newDbRecord'
import {
  DayDiet,
  dayDietSchema,
} from '@/src/modules/diet/day-diet/domain/dayDiet'

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
