/**
 * @fileoverview Utility functions for date manipulation and formatting
 *
 * This module provides a comprehensive set of utilities for working with dates,
 * including timezone adjustments, formatting, and date normalization.
 */

/**
 * Options for date formatting functions
 */
export type DateFormatOptions = {
  /** Whether to keep the original time or set to midnight */
  keepTime?: boolean
}

/**
 * Gets the current date at midnight in the local timezone
 *
 * @returns {Date} Current date at midnight (00:00:00)
 *
 * @example
 * ```typescript
 * const today = getToday()
 * console.log(today) // 2024-01-15T00:00:00.000Z (adjusted for timezone)
 * ```
 */
export function getToday(): Date {
  return adjustToTimezone(getMidnight(new Date()))
}

/**
 * Gets today's date formatted as YYYY-MM-DD string
 *
 * @returns {string} Today's date in YYYY-MM-DD format
 *
 * @example
 * ```typescript
 * const todayString = getTodayYYYYMMDD()
 * console.log(todayString) // "2024-01-15"
 * ```
 */
export function getTodayYYYYMMDD(): string {
  return dateToYYYYMMDD(getToday())
}

/**
 * Converts a UTC date to a local date (preserving the same wall time)
 * @param {Date} date - The UTC date
 * @returns {Date} Local date
 * @example
 * // For a user in GMT-3:
 * // UTC: 2024-06-03T15:00:00.000Z
 * // Local: 2024-06-03T12:00:00.000Z
 * const utcDate = new Date('2024-06-03T15:00:00.000Z')
 * const localDate = toLocalDate(utcDate)
 * console.log(localDate.toISOString()) // "2024-06-03T12:00:00.000Z"
 */
export function toLocalDate(date: Date): Date {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
}

/**
 * Converts a local date to a UTC date (preserving the same wall time)
 * @param {Date} date - The local date
 * @returns {Date} UTC date
 * @example
 * // For a user in GMT-3:
 * // Local: 2024-06-03T12:00:00.000Z
 * // UTC: 2024-06-03T15:00:00.000Z
 * const localDate = new Date('2024-06-03T12:00:00.000Z')
 * const utcDate = toUTCDate(localDate)
 * console.log(utcDate.toISOString()) // "2024-06-03T15:00:00.000Z"
 */
export function toUTCDate(date: Date): Date {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000)
}

/**
 * Adjusts a date to the user's local timezone (alias for toLocalDate)
 * @param {Date} date - The date to adjust
 * @returns {Date} Date adjusted to local timezone
 */
export function adjustToTimezone(date: Date): Date {
  return toLocalDate(date)
}

/**
 * Sets a date to midnight (00:00:00.000)
 *
 * @param {Date} date - The date to normalize to midnight
 * @returns {Date} New date set to midnight
 *
 * @example
 * ```typescript
 * const someDate = new Date('2024-01-15T15:30:45')
 * const midnight = getMidnight(someDate)
 * console.log(midnight) // 2024-01-15T00:00:00.000Z
 * ```
 */
export function getMidnight(date: Date): Date {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}

/**
 * Converts a string or Date to a normalized Date object
 *
 * @param {string | Date} day - The date string or Date object to convert
 * @param {DateFormatOptions} options - Formatting options
 * @returns {Date} Converted and normalized Date object
 *
 * @example
 * ```typescript
 * // Keep original time
 * const dateWithTime = stringToDate('2024-01-15T15:30:00')
 *
 * // Set to midnight in UTC
 * const dateAtMidnight = stringToDate('2024-01-15T15:30:00', { keepTime: false })
 * ```
 */
export function stringToDate(
  day: string | Date,
  options?: DateFormatOptions,
): Date {
  const date = new Date(day)

  if (options?.keepTime === undefined || options.keepTime) {
    return date
  }

  const dateString = dateToYYYYMMDD(date)
  return new Date(`${dateString}T00:00:00Z`)
}

/**
 * Formats a date as YYYY-MM-DD string
 *
 * @param {Date} date - The date to format
 * @returns {string} Date formatted as YYYY-MM-DD
 *
 * @example
 * ```typescript
 * const date = new Date('2024-01-15T15:30:00')
 * const formatted = dateToYYYYMMDD(date)
 * console.log(formatted) // "2024-01-15"
 * ```
 */
export function dateToYYYYMMDD(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Formats a date as DD/MM string
 *
 * @param {Date} date - The date to format
 * @returns {string} Date formatted as DD/MM
 *
 * @example
 * ```typescript
 * const date = new Date('2024-01-15')
 * const formatted = dateToDDMM(date)
 * console.log(formatted) // "15/1"
 * ```
 */
export function dateToDDMM(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${day}/${month}`
}

/**
 * Converts a date to ISO string format
 *
 * @param {Date} date - The date to convert
 * @returns {string} Date in ISO string format
 *
 * @example
 * ```typescript
 * const date = new Date('2024-01-15T15:30:00')
 * const isoString = dateToString(date)
 * console.log(isoString) // "2024-01-15T15:30:00.000Z"
 * ```
 */
export function dateToString(date: Date): string {
  return date.toISOString()
}

/**
 * Calculates the difference between two dates in days
 *
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {number} Number of days between the dates
 *
 * @example
 * ```typescript
 * const start = new Date('2024-01-15')
 * const end = new Date('2024-01-20')
 * const diff = daysBetween(start, end)
 * console.log(diff) // 5
 * ```
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000 // hours*minutes*seconds*milliseconds
  const firstDate = getMidnight(startDate)
  const secondDate = getMidnight(endDate)

  return Math.round(
    Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay),
  )
}

/**
 * Adds a specified number of days to a date
 *
 * @param {Date} date - The base date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} New date with days added
 *
 * @example
 * ```typescript
 * const baseDate = new Date('2024-01-15')
 * const futureDate = addDays(baseDate, 7)
 * console.log(futureDate) // 2024-01-22
 *
 * const pastDate = addDays(baseDate, -3)
 * console.log(pastDate) // 2024-01-12
 * ```
 */
export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

/**
 * Checks if two dates are on the same day
 *
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if dates are on the same day
 *
 * @example
 * ```typescript
 * const date1 = new Date('2024-01-15T09:00:00')
 * const date2 = new Date('2024-01-15T17:30:00')
 * const isSame = isSameDay(date1, date2)
 * console.log(isSame) // true
 * ```
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}
