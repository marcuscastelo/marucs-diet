import { describe, expect, it } from 'vitest'

import { calculateWeightProgress } from '~/legacy/utils/weightUtils'
// Mock Weight type
import { type Weight } from '~/modules/weight/domain/weight'

describe('calculateWeightProgress', () => {
  function makeWeight(weight: number): Weight {
    return {
      id: 1,
      owner: 1,
      weight,
      target_timestamp: new Date(),
      __type: 'Weight',
    }
  }

  it('returns null for empty weights', () => {
    expect(calculateWeightProgress([], 80)).toBeNull()
  })

  it('returns 0 for first weight equals target weight', () => {
    const weights = [makeWeight(80)]
    expect(calculateWeightProgress(weights, 80)).toBe(0)
  })

  it('returns correct progress for weight loss', () => {
    const weights = [makeWeight(100), makeWeight(90)]
    expect(calculateWeightProgress(weights, 80)).toBeCloseTo(0.5)
  })

  it('returns correct progress for weight gain', () => {
    const weights = [makeWeight(60), makeWeight(70)]
    expect(calculateWeightProgress(weights, 80)).toBeCloseTo(0.5)
  })

  it('returns null if only one weight and it does not match target', () => {
    const weights = [makeWeight(70)]
    expect(calculateWeightProgress(weights, 80)).toBeNull()
  })

  it('returns 1 for first weight far from target and latest equals target', () => {
    const weights = [makeWeight(100), makeWeight(80)]
    expect(calculateWeightProgress(weights, 80)).toBe(1)
  })

  it('returns 0 for no change', () => {
    const weights = [makeWeight(100), makeWeight(100)]
    expect(calculateWeightProgress(weights, 80)).toBe(0)
  })

  it('returns 0 for division by zero (first and target equal, multiple weights)', () => {
    const weights = [makeWeight(80), makeWeight(80)]
    expect(calculateWeightProgress(weights, 80)).toBe(0)
  })
})
