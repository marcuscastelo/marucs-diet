/**
 * @fileoverview Field transform utilities for form validation and conversion
 */

import { dateToString, stringToDate } from '~/shared/utils/date'

export type FieldTransform<T> = {
  toRaw: (value: T) => string
  toValue: (value: string) => T
}

/**
 * Normalizes a numeric string by handling common input patterns
 */
function normalizeNumericString(value: string): string {
  return value
    .replace(/,/g, '.') // Replace commas with dots (treat them the same)
    .replace(/\.(?=.*\.)/g, '') // Remove all but the last dot
    .replace(/-/g, '') // Remove minus signs
    .replace(/\+/g, '') // Remove plus signs
    .replace(/\s/g, '') // Remove spaces
    .replace(/^0+(?=\d)/g, '') // Remove leading zeros
}

/**
 * Creates a transform for floating point numbers with validation
 */
export function createFloatTransform(
  options: {
    decimalPlaces?: number
    defaultValue?: number
    maxValue?: number
  } = {},
): FieldTransform<number> {
  const { decimalPlaces = 2, defaultValue = 0, maxValue } = options

  return {
    toRaw: (value: number) => {
      const clampedValue =
        typeof maxValue === 'number' && !isNaN(maxValue)
          ? Math.min(value, maxValue)
          : value
      return clampedValue.toFixed(decimalPlaces)
    },

    toValue: (value: string) => {
      const normalized = normalizeNumericString(value)
      const parsed = parseFloat(normalized)

      if (isNaN(parsed)) {
        if (typeof maxValue === 'number' && !isNaN(maxValue)) {
          return Math.min(maxValue, defaultValue)
        }
        return defaultValue
      }

      const fixed = parseFloat(parsed.toFixed(decimalPlaces))
      return typeof maxValue === 'number' && !isNaN(maxValue)
        ? Math.min(maxValue, fixed)
        : fixed
    },
  }
}

/**
 * Creates a transform for Date objects
 */
export function createDateTransform(): FieldTransform<Date> {
  return {
    toRaw: (value: Date) => dateToString(value),
    toValue: (value: string) => stringToDate(value),
  }
}
