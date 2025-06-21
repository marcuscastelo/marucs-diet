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
    minValue?: number
  } = {},
): FieldTransform<number> {
  const { decimalPlaces = 2, defaultValue = 0, maxValue, minValue } = options

  return {
    toRaw: (value: number) => {
      let clampedValue = value
      if (typeof maxValue === 'number' && !isNaN(maxValue)) {
        clampedValue = Math.min(clampedValue, maxValue)
      }
      if (typeof minValue === 'number' && !isNaN(minValue)) {
        clampedValue = Math.max(clampedValue, minValue)
      }
      return clampedValue.toFixed(decimalPlaces)
    },

    toValue: (value: string) => {
      const normalized = normalizeNumericString(value)
      const parsed = parseFloat(normalized)

      if (isNaN(parsed)) {
        let fallback = defaultValue
        if (typeof maxValue === 'number' && !isNaN(maxValue)) {
          fallback = Math.min(maxValue, fallback)
        }
        if (typeof minValue === 'number' && !isNaN(minValue)) {
          fallback = Math.max(minValue, fallback)
        }
        return fallback
      }

      let fixed = parseFloat(parsed.toFixed(decimalPlaces))
      if (typeof maxValue === 'number' && !isNaN(maxValue)) {
        fixed = Math.min(maxValue, fixed)
      }
      if (typeof minValue === 'number' && !isNaN(minValue)) {
        fixed = Math.max(minValue, fixed)
      }
      return fixed
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
