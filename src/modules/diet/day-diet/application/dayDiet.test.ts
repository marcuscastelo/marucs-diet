import { describe, expect, it } from 'vitest'

import { getPreviousDayDiets } from '~/modules/diet/day-diet/application/dayDiet'
import {
  createNewDayDiet,
  type DayDiet,
  promoteDayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'

const makeDay = (target_day: string, id: number): DayDiet =>
  promoteDayDiet(
    createNewDayDiet({
      target_day,
      owner: 1,
      meals: [],
    }),
    id,
  )

describe('getPreviousDayDiets', () => {
  it('returns all days before selectedDay, ordered descending', () => {
    const days = [
      makeDay('2024-01-01', 1),
      makeDay('2024-01-05', 2),
      makeDay('2024-01-03', 3),
      makeDay('2024-01-10', 4),
    ]
    const result = getPreviousDayDiets(days, '2024-01-06')
    expect(result.map((d) => d.target_day)).toEqual([
      '2024-01-05',
      '2024-01-03',
      '2024-01-01',
    ])
  })

  it('returns empty if no previous days', () => {
    const days = [makeDay('2024-01-10', 1)]
    const result = getPreviousDayDiets(days, '2024-01-01')
    expect(result).toEqual([])
  })

  it('ignores days equal to selectedDay', () => {
    const days = [makeDay('2024-01-01', 1), makeDay('2024-01-02', 2)]
    const result = getPreviousDayDiets(days, '2024-01-01')
    expect(result).toEqual([])
  })
})
