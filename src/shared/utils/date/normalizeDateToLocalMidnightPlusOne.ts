/**
 * Normalizes a date string or Date object to midnight (00:00) in the local timezone and increments by one day.
 *
 * @param {string | Date} input - The date to normalize
 * @returns {Date} The normalized date at midnight, incremented by one day
 */

import { adjustToTimezone, getMidnight } from '~/shared/utils/date/dateUtils'

export function normalizeDateToLocalMidnightPlusOne(
  input: string | Date,
): Date {
  let date = getMidnight(adjustToTimezone(new Date(input)))
  date.setDate(date.getDate() + 1)
  return date
}
