import { describe, expect, it } from 'vitest'

import {
  calculateAverage,
  calculateBodyFatFromAverages,
  calculateBodyMeasureAverages,
  filterWeightsByDate,
  groupMeasuresByDay,
  isValidBodyMeasure,
  processMeasuresByDay,
} from '~/modules/measure/application/measureUtils'
import type { BodyMeasure } from '~/modules/measure/domain/measure'
import type { Weight } from '~/modules/weight/domain/weight'

describe('measureUtils', () => {
  describe('groupMeasuresByDay', () => {
    it('should group measures by date string', () => {
      const measures: BodyMeasure[] = [
        {
          __type: 'BodyMeasure',
          id: 1,
          userId: 1,
          target_timestamp: new Date('2023-01-01T10:00:00Z'),
          height: 170,
          waist: 80,
          hip: 90,
          neck: 35,
        },
        {
          __type: 'BodyMeasure',
          id: 2,
          userId: 1,
          target_timestamp: new Date('2023-01-01T14:00:00Z'),
          height: 171,
          waist: 81,
          hip: 91,
          neck: 36,
        },
        {
          __type: 'BodyMeasure',
          id: 3,
          userId: 1,
          target_timestamp: new Date('2023-01-02T10:00:00Z'),
          height: 172,
          waist: 82,
          hip: 92,
          neck: 37,
        },
      ]

      const result = groupMeasuresByDay(measures)

      expect(Object.keys(result)).toHaveLength(2)
      expect(result['2023-01-01']).toHaveLength(2)
      expect(result['2023-01-02']).toHaveLength(1)
    })

    it('should handle empty array', () => {
      const result = groupMeasuresByDay([])
      expect(result).toEqual({})
    })
  })

  describe('isValidBodyMeasure', () => {
    it('should return true for valid measure', () => {
      const measure: BodyMeasure = {
        __type: 'BodyMeasure',
        id: 1,
        userId: 1,
        target_timestamp: new Date(),
        height: 170,
        waist: 80,
        hip: 90,
        neck: 35,
      }

      expect(isValidBodyMeasure(measure)).toBe(true)
    })

    it('should return true for valid measure without hip', () => {
      const measure: BodyMeasure = {
        __type: 'BodyMeasure',
        id: 1,
        userId: 1,
        target_timestamp: new Date(),
        height: 170,
        waist: 80,
        hip: undefined,
        neck: 35,
      }

      expect(isValidBodyMeasure(measure)).toBe(true)
    })

    it('should return false for invalid height', () => {
      const measure: BodyMeasure = {
        __type: 'BodyMeasure',
        id: 1,
        userId: 1,
        target_timestamp: new Date(),
        height: 0,
        waist: 80,
        hip: 90,
        neck: 35,
      }

      expect(isValidBodyMeasure(measure)).toBe(false)
    })

    it('should return false for NaN values', () => {
      const measure: BodyMeasure = {
        __type: 'BodyMeasure',
        id: 1,
        userId: 1,
        target_timestamp: new Date(),
        height: NaN,
        waist: 80,
        hip: 90,
        neck: 35,
      }

      expect(isValidBodyMeasure(measure)).toBe(false)
    })

    it('should return false for invalid hip when present', () => {
      const measure: BodyMeasure = {
        __type: 'BodyMeasure',
        id: 1,
        userId: 1,
        target_timestamp: new Date(),
        height: 170,
        waist: 80,
        hip: -5,
        neck: 35,
      }

      expect(isValidBodyMeasure(measure)).toBe(false)
    })
  })

  describe('calculateAverage', () => {
    it('should calculate average correctly', () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3)
      expect(calculateAverage([10, 20])).toBe(15)
      expect(calculateAverage([100])).toBe(100)
    })

    it('should return 0 for empty array', () => {
      expect(calculateAverage([])).toBe(0)
    })

    it('should handle decimal values', () => {
      expect(calculateAverage([1.5, 2.5, 3.5])).toBe(2.5)
    })
  })

  describe('calculateBodyMeasureAverages', () => {
    it('should calculate averages correctly', () => {
      const measures: BodyMeasure[] = [
        {
          __type: 'BodyMeasure',
          id: 1,
          userId: 1,
          target_timestamp: new Date(),
          height: 170,
          waist: 80,
          hip: 90,
          neck: 35,
        },
        {
          __type: 'BodyMeasure',
          id: 2,
          userId: 1,
          target_timestamp: new Date(),
          height: 180,
          waist: 90,
          hip: 100,
          neck: 40,
        },
      ]

      const result = calculateBodyMeasureAverages(measures)

      expect(result.height).toBe(175)
      expect(result.waist).toBe(85)
      expect(result.hip).toBe(95)
      expect(result.neck).toBe(37.5)
    })

    it('should handle measures without hip', () => {
      const measures: BodyMeasure[] = [
        {
          __type: 'BodyMeasure',
          id: 1,
          userId: 1,
          target_timestamp: new Date(),
          height: 170,
          waist: 80,
          hip: undefined,
          neck: 35,
        },
        {
          __type: 'BodyMeasure',
          id: 2,
          userId: 1,
          target_timestamp: new Date(),
          height: 180,
          waist: 90,
          hip: 100,
          neck: 40,
        },
      ]

      const result = calculateBodyMeasureAverages(measures)

      expect(result.height).toBe(175)
      expect(result.waist).toBe(85)
      expect(result.hip).toBe(100) // Only one hip value
      expect(result.neck).toBe(37.5)
    })

    it('should return undefined hip when no hip measurements', () => {
      const measures: BodyMeasure[] = [
        {
          __type: 'BodyMeasure',
          id: 1,
          userId: 1,
          target_timestamp: new Date(),
          height: 170,
          waist: 80,
          hip: undefined,
          neck: 35,
        },
      ]

      const result = calculateBodyMeasureAverages(measures)

      expect(result.hip).toBeUndefined()
    })
  })

  describe('filterWeightsByDate', () => {
    it('should filter weights by date', () => {
      const weights: readonly Weight[] = [
        {
          __type: 'Weight',
          id: 1,
          userId: 1,
          target_timestamp: new Date('2023-01-01T10:00:00Z'),
          weight: 70,
        },
        {
          __type: 'Weight',
          id: 2,
          userId: 1,
          target_timestamp: new Date('2023-01-02T10:00:00Z'),
          weight: 71,
        },
      ]

      const result = filterWeightsByDate(weights, '1/1/2023')

      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe(1)
    })

    it('should filter out invalid weights', () => {
      const weights: readonly Weight[] = [
        {
          __type: 'Weight',
          id: 1,
          userId: 1,
          target_timestamp: new Date('2023-01-01T10:00:00Z'),
          weight: 70,
        },
        {
          __type: 'Weight',
          id: 2,
          userId: 1,
          target_timestamp: new Date('2023-01-01T14:00:00Z'),
          weight: 0,
        },
        {
          __type: 'Weight',
          id: 3,
          userId: 1,
          target_timestamp: new Date('2023-01-01T18:00:00Z'),
          weight: NaN,
        },
      ]

      const result = filterWeightsByDate(weights, '1/1/2023')

      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe(1)
    })
  })

  describe('calculateBodyFatFromAverages', () => {
    it('should calculate body fat percentage', () => {
      const averages = {
        height: 170,
        waist: 80,
        hip: 90,
        neck: 35,
      }

      const result = calculateBodyFatFromAverages(averages, 'male', 70)

      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(100)
      expect(Number.isFinite(result)).toBe(true)
    })

    it('should return 0 for invalid calculations', () => {
      const averages = {
        height: 0,
        waist: 0,
        hip: 0,
        neck: 0,
      }

      const result = calculateBodyFatFromAverages(averages, 'male', 0)

      expect(result).toBe(0)
    })

    it('should handle female gender', () => {
      const averages = {
        height: 160,
        waist: 70,
        hip: 90,
        neck: 32,
      }

      const result = calculateBodyFatFromAverages(averages, 'female', 60)

      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(100)
    })
  })

  describe('processMeasuresByDay', () => {
    it('should process measures and weights correctly', () => {
      const groupedMeasures = {
        '2023-01-01': [
          {
            __type: 'BodyMeasure' as const,
            id: 1,
            userId: 1,
            target_timestamp: new Date('2023-01-01T10:00:00Z'),
            height: 170,
            waist: 80,
            hip: 90,
            neck: 35,
          },
          {
            __type: 'BodyMeasure' as const,
            id: 2,
            userId: 1,
            target_timestamp: new Date('2023-01-01T14:00:00Z'),
            height: 172,
            waist: 82,
            hip: 92,
            neck: 37,
          },
        ],
      }

      const weights: readonly Weight[] = [
        {
          __type: 'Weight',
          id: 1,
          userId: 1,
          target_timestamp: new Date('2023-01-01T10:00:00Z'),
          weight: 70,
        },
        {
          __type: 'Weight',
          id: 2,
          userId: 1,
          target_timestamp: new Date('2023-01-01T14:00:00Z'),
          weight: 72,
        },
      ]

      const result = processMeasuresByDay(groupedMeasures, weights, 'male')

      expect(result).toHaveLength(1)
      expect(result[0]?.date).toBe('2023-01-01')
      expect(result[0]?.dayAverage.height).toBe(171)
      expect(result[0]?.dayAverage.waist).toBe(81)
      expect(result[0]?.dayBf).toBeGreaterThan(0)
    })

    it('should filter out invalid measures', () => {
      const groupedMeasures = {
        '2023-01-01': [
          {
            __type: 'BodyMeasure' as const,
            id: 1,
            userId: 1,
            target_timestamp: new Date('2023-01-01T10:00:00Z'),
            height: 0, // Invalid
            waist: 80,
            hip: 90,
            neck: 35,
          },
        ],
      }

      const result = processMeasuresByDay(groupedMeasures, [], 'male')

      expect(result).toHaveLength(0)
    })

    it('should sort results by date', () => {
      const groupedMeasures = {
        '2023-01-02': [
          {
            __type: 'BodyMeasure' as const,
            id: 2,
            userId: 1,
            target_timestamp: new Date('2023-01-02T10:00:00Z'),
            height: 172,
            waist: 82,
            hip: 92,
            neck: 37,
          },
        ],
        '2023-01-01': [
          {
            __type: 'BodyMeasure' as const,
            id: 1,
            userId: 1,
            target_timestamp: new Date('2023-01-01T10:00:00Z'),
            height: 170,
            waist: 80,
            hip: 90,
            neck: 35,
          },
        ],
      }

      const result = processMeasuresByDay(groupedMeasures, [], 'male')

      expect(result).toHaveLength(2)
      expect(result[0]?.date).toBe('2023-01-01')
      expect(result[1]?.date).toBe('2023-01-02')
    })
  })
})
