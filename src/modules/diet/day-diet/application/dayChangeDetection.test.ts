import { describe, expect, it, vi } from 'vitest'

import {
  acceptDayChange,
  currentToday,
  dayChangeData,
  dismissDayChangeModal,
  setCurrentToday,
  setDayChangeData,
} from '~/modules/diet/day-diet/application/dayDiet'
import * as dateUtils from '~/shared/utils/date/dateUtils'

describe('Day Change Detection', () => {
  it('should update currentToday signal when day changes', () => {
    const newDay = '2024-01-16'
    setCurrentToday(newDay)
    expect(currentToday()).toBe(newDay)
  })

  it('should set day change data when day changes', () => {
    const changeData = {
      previousDay: '2024-01-15',
      newDay: '2024-01-16',
    }
    setDayChangeData(changeData)
    expect(dayChangeData()).toEqual(changeData)
  })

  it('should dismiss day change modal', () => {
    setDayChangeData({
      previousDay: '2024-01-15',
      newDay: '2024-01-16',
    })
    dismissDayChangeModal()
    expect(dayChangeData()).toBeNull()
  })

  it('should accept day change and navigate to new day', () => {
    vi.spyOn(dateUtils, 'getTodayYYYYMMDD').mockReturnValue('2024-01-16')

    setDayChangeData({
      previousDay: '2024-01-15',
      newDay: '2024-01-16',
    })

    acceptDayChange()

    expect(dayChangeData()).toBeNull()
  })
})
