/**
 * @fileoverview Unit tests for field transform utilities
 */

import { describe, expect, it, vi } from 'vitest'

import { createFloatTransform } from '~/sections/common/hooks/transforms/fieldTransforms'

// Mock the date utils module
vi.mock('~/shared/utils/date/dateUtils', () => ({
  dateToString: vi.fn(),
  stringToDate: vi.fn(),
}))

describe('fieldTransforms', () => {
  describe('createFloatTransform', () => {
    describe('default behavior', () => {
      const transform = createFloatTransform()

      it('should convert number to string with 2 decimal places by default', () => {
        expect(transform.toRaw(123.456)).toBe('123.46')
        expect(transform.toRaw(123)).toBe('123.00')
        expect(transform.toRaw(0)).toBe('0.00')
      })

      it('should parse valid numeric strings', () => {
        expect(transform.toValue('123.45')).toBe(123.45)
        expect(transform.toValue('123')).toBe(123.0)
        expect(transform.toValue('0')).toBe(0.0)
      })

      it('should handle comma as decimal separator', () => {
        expect(transform.toValue('123,45')).toBe(123.45)
        expect(transform.toValue('1,234.56')).toBe(1234.56) // Comma->dot, keep last dot
      })

      it('should normalize problematic input patterns', () => {
        expect(transform.toValue('12.34.56')).toBe(1234.56) // Multiple dots - keeps last dot
        expect(transform.toValue('123-456')).toBe(123456.0) // Minus signs
        expect(transform.toValue('123+456')).toBe(123456.0) // Plus signs
        expect(transform.toValue('1 2 3')).toBe(123.0) // Spaces
        expect(transform.toValue('00123')).toBe(123.0) // Leading zeros
      })

      it('should return default value for invalid input', () => {
        expect(transform.toValue('abc')).toBe(0)
        expect(transform.toValue('')).toBe(0)
        expect(transform.toValue('invalid')).toBe(0)
      })
    })

    describe('with custom decimal places', () => {
      const transform = createFloatTransform({ decimalPlaces: 1 })

      it('should respect custom decimal places', () => {
        expect(transform.toRaw(123.456)).toBe('123.5')
        expect(transform.toValue('123.456')).toBe(123.5)
      })
    })

    describe('with custom default value', () => {
      const transform = createFloatTransform({ defaultValue: 10 })

      it('should use custom default for invalid input', () => {
        expect(transform.toValue('invalid')).toBe(10)
        expect(transform.toValue('')).toBe(10)
      })
    })

    describe('with max value', () => {
      const transform = createFloatTransform({ maxValue: 100 })

      it('should clamp values to max in toRaw', () => {
        expect(transform.toRaw(150)).toBe('100.00')
        expect(transform.toRaw(50)).toBe('50.00')
      })

      it('should clamp values to max in toValue', () => {
        expect(transform.toValue('150')).toBe(100)
        expect(transform.toValue('50')).toBe(50)
      })

      it('should clamp default value to max', () => {
        const transformWithDefault = createFloatTransform({
          maxValue: 50,
          defaultValue: 100,
        })
        expect(transformWithDefault.toValue('invalid')).toBe(50)
      })
    })

    describe('complex scenarios', () => {
      const transform = createFloatTransform({
        decimalPlaces: 3,
        defaultValue: 5,
        maxValue: 1000,
      })

      it('should handle all options together', () => {
        expect(transform.toRaw(123.456789)).toBe('123.457')
        expect(transform.toRaw(2000)).toBe('1000.000')
        expect(transform.toValue('invalid')).toBe(5)
        expect(transform.toValue('2000')).toBe(1000)
      })
    })
  })
})
