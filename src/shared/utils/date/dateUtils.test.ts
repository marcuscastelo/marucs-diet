import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  addDays,
  adjustToTimezone,
  dateToDDMM,
  dateToString,
  dateToYYYYMMDD,
  daysBetween,
  getMidnight,
  getToday,
  getTodayYYYYMMDD,
  isSameDay,
  stringToDate,
  toLocalDate,
  toUTCDate,
} from '~/shared/utils/date/dateUtils'

describe('dateUtils', () => {
  let mockDate: Date

  beforeEach(() => {
    // Mock a specific date for consistent testing
    mockDate = new Date('2024-01-15T12:30:45.123Z')
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getToday', () => {
    it('should return today at midnight adjusted for timezone', () => {
      const today = getToday()
      // The legacy implementation adjusts the timezone, so it won't be midnight in local time
      // but it should still be a valid date
      expect(today).toBeInstanceOf(Date)
      expect(today.getMinutes()).toBe(0)
      expect(today.getSeconds()).toBe(0)
      expect(today.getMilliseconds()).toBe(0)
    })
  })

  describe('getTodayYYYYMMDD', () => {
    it('should return today formatted as YYYY-MM-DD', () => {
      const todayString = getTodayYYYYMMDD()
      expect(todayString).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('adjustToTimezone', () => {
    it('should create a copy of the date and adjust timezone', () => {
      const utcDate = new Date('2024-01-15T12:00:00Z')
      const adjustedDate = adjustToTimezone(utcDate)

      expect(adjustedDate).toBeInstanceOf(Date)
      expect(adjustedDate).not.toBe(utcDate)
      // Only assert time difference if timezone offset is not zero
      if (utcDate.getTimezoneOffset() !== 0) {
        expect(adjustedDate.getTime()).not.toBe(utcDate.getTime())
      } else {
        expect(adjustedDate.getTime()).toBe(utcDate.getTime())
      }
    })

    it('should handle dates in different timezones consistently', () => {
      const date1 = new Date('2024-01-15T00:00:00Z')
      const date2 = new Date('2024-01-15T23:59:59Z')

      const adjusted1 = adjustToTimezone(date1)
      const adjusted2 = adjustToTimezone(date2)

      expect(adjusted1).toBeInstanceOf(Date)
      expect(adjusted2).toBeInstanceOf(Date)
    })

    it('should accurately handle minute-based timezone offsets', () => {
      // Use vi.spyOn to mock the method safely
      const mockGetTimezoneOffset = vi.spyOn(
        Date.prototype,
        'getTimezoneOffset',
      )

      // Mock +05:30 timezone (330 minutes behind UTC)
      mockGetTimezoneOffset.mockReturnValue(-330)

      try {
        const utcDate = new Date('2024-01-15T12:00:00Z')
        const adjusted = adjustToTimezone(utcDate)

        // Should add 5.5 hours (330 minutes) to UTC time
        expect(adjusted.toISOString()).toBe('2024-01-15T17:30:00.000Z')
      } finally {
        // Restore the original method
        mockGetTimezoneOffset.mockRestore()
      }
    })
  })

  describe('getMidnight', () => {
    it('should set time to midnight', () => {
      const someDate = new Date('2024-01-15T15:30:45.123Z')
      const midnight = getMidnight(someDate)

      expect(midnight.getFullYear()).toBe(2024)
      expect(midnight.getMonth()).toBe(0) // January is 0
      expect(midnight.getDate()).toBe(15)
      expect(midnight.getHours()).toBe(0)
      expect(midnight.getMinutes()).toBe(0)
      expect(midnight.getSeconds()).toBe(0)
      expect(midnight.getMilliseconds()).toBe(0)
    })

    it('should not modify the original date', () => {
      const originalDate = new Date('2024-01-15T15:30:45.123Z')
      const originalTime = originalDate.getTime()

      getMidnight(originalDate)

      expect(originalDate.getTime()).toBe(originalTime)
    })
  })

  describe('stringToDate', () => {
    it('should convert string to date keeping time by default', () => {
      const dateString = '2024-01-15T15:30:00'
      const result = stringToDate(dateString)

      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(15)
      expect(result.getMinutes()).toBe(30)
    })

    it('should convert string to date with keepTime option true', () => {
      const dateString = '2024-01-15T15:30:00'
      const result = stringToDate(dateString, { keepTime: true })

      expect(result.getHours()).toBe(15)
      expect(result.getMinutes()).toBe(30)
    })

    it('should convert string to date at midnight with keepTime option false', () => {
      const dateString = '2024-01-15T15:30:00'
      const result = stringToDate(dateString, { keepTime: false })

      // Legacy implementation creates UTC midnight, so check UTC time
      expect(result.getUTCHours()).toBe(0)
      expect(result.getUTCMinutes()).toBe(0)
      expect(result.getUTCSeconds()).toBe(0)
    })

    it('should handle Date objects', () => {
      const date = new Date('2024-01-15T15:30:00')
      const result = stringToDate(date)

      expect(result.getTime()).toBe(date.getTime())
    })

    it('should handle empty options object', () => {
      const dateString = '2024-01-15T15:30:00'
      const result = stringToDate(dateString, {})

      expect(result.getHours()).toBe(15)
      expect(result.getMinutes()).toBe(30)
    })
  })

  describe('dateToYYYYMMDD', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T15:30:00Z')
      const formatted = dateToYYYYMMDD(date)

      expect(formatted).toBe('2024-01-15')
    })

    it('should handle different months and days', () => {
      const date = new Date('2024-12-03T15:30:00Z')
      const formatted = dateToYYYYMMDD(date)

      expect(formatted).toBe('2024-12-03')
    })
  })

  describe('dateToDDMM', () => {
    it('should format date as DD/MM', () => {
      const date = new Date('2024-01-15T15:30:00Z')
      const formatted = dateToDDMM(date)

      expect(formatted).toBe('15/1')
    })

    it('should handle different months', () => {
      const date = new Date('2024-12-03T15:30:00Z')
      const formatted = dateToDDMM(date)

      expect(formatted).toBe('3/12')
    })

    it('should handle single digit days and months', () => {
      const date = new Date('2024-02-05T15:30:00Z')
      const formatted = dateToDDMM(date)

      expect(formatted).toBe('5/2')
    })
  })

  describe('dateToString', () => {
    it('should return ISO string format', () => {
      const date = new Date('2024-01-15T15:30:00.123Z')
      const result = dateToString(date)

      expect(result).toBe('2024-01-15T15:30:00.123Z')
    })
  })

  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      const start = new Date('2024-01-15')
      const end = new Date('2024-01-20')
      const days = daysBetween(start, end)

      expect(days).toBe(5)
    })

    it('should return absolute difference', () => {
      const start = new Date('2024-01-20')
      const end = new Date('2024-01-15')
      const days = daysBetween(start, end)

      expect(days).toBe(5)
    })

    it('should handle same day', () => {
      const date = new Date('2024-01-15')
      const days = daysBetween(date, date)

      expect(days).toBe(0)
    })

    it('should ignore time when calculating days', () => {
      const start = new Date('2024-01-15T09:00:00')
      const end = new Date('2024-01-16T17:30:00')
      const days = daysBetween(start, end)

      expect(days).toBe(1)
    })
  })

  describe('addDays', () => {
    it('should add positive days', () => {
      const baseDate = new Date('2024-01-15T00:00:00')
      const futureDate = addDays(baseDate, 7)

      expect(futureDate.getDate()).toBe(22)
      expect(futureDate.getMonth()).toBe(0) // January
      expect(futureDate.getFullYear()).toBe(2024)
    })

    it('should subtract days with negative input', () => {
      const baseDate = new Date('2024-01-15T00:00:00')
      const pastDate = addDays(baseDate, -3)

      expect(pastDate.getDate()).toBe(12)
      expect(pastDate.getMonth()).toBe(0) // January
      expect(pastDate.getFullYear()).toBe(2024)
    })

    it('should handle month boundaries', () => {
      const baseDate = new Date('2024-01-30T00:00:00')
      const nextMonth = addDays(baseDate, 5)

      expect(nextMonth.getDate()).toBe(4)
      expect(nextMonth.getMonth()).toBe(1) // February
      expect(nextMonth.getFullYear()).toBe(2024)
    })

    it('should not modify original date', () => {
      const originalDate = new Date('2024-01-15T00:00:00')
      const originalTime = originalDate.getTime()

      addDays(originalDate, 5)

      expect(originalDate.getTime()).toBe(originalTime)
    })
  })

  describe('isSameDay', () => {
    it('should return true for same day with different times', () => {
      const date1 = new Date('2024-01-15T09:00:00')
      const date2 = new Date('2024-01-15T17:30:00')

      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('should return false for different days', () => {
      const date1 = new Date('2024-01-15T23:59:59')
      const date2 = new Date('2024-01-16T00:00:01')

      expect(isSameDay(date1, date2)).toBe(false)
    })

    it('should handle same date objects', () => {
      const date = new Date('2024-01-15T12:00:00')

      expect(isSameDay(date, date)).toBe(true)
    })
  })

  describe('time conversion', () => {
    it('toLocalDate should convert UTC date to local time', () => {
      const utcDate = new Date(Date.UTC(2024, 5, 3, 15, 0, 0))
      const localDate = toLocalDate(utcDate)
      if (utcDate.getTimezoneOffset() !== 0) {
        expect(localDate.getUTCHours()).not.toBe(utcDate.getUTCHours())
      } else {
        expect(localDate.getUTCHours()).toBe(utcDate.getUTCHours())
      }
      expect(localDate.getUTCDate()).toBe(utcDate.getUTCDate())
      expect(localDate.getUTCMonth()).toBe(utcDate.getUTCMonth())
      expect(localDate.getUTCFullYear()).toBe(utcDate.getUTCFullYear())
    })

    it('toUTCDate should convert local date to UTC time', () => {
      const localDate = new Date(2024, 5, 3, 12, 0, 0)
      const utcDate = toUTCDate(localDate)
      if (localDate.getTimezoneOffset() !== 0) {
        expect(utcDate.getUTCHours()).not.toBe(localDate.getHours())
      } else {
        expect(utcDate.getUTCHours()).toBe(localDate.getHours())
      }
      expect(utcDate.getUTCDate()).toBe(localDate.getDate())
      expect(utcDate.getUTCMonth()).toBe(localDate.getMonth())
      expect(utcDate.getUTCFullYear()).toBe(localDate.getFullYear())
    })

    it('adjustToTimezone should be an alias for toLocalDate', () => {
      const date = new Date('2024-06-03T15:00:00.000Z')
      expect(adjustToTimezone(date).getTime()).toBe(toLocalDate(date).getTime())
    })
  })
})
