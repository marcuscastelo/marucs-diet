import { describe, expect, it } from 'vitest'

import { calculateWeightProgress } from '~/legacy/utils/weightUtils'
// Mock Weight type
import { type Weight } from '~/modules/weight/domain/weight'

describe('calculateWeightProgress', () => {
  /**
   * Creates a mock Weight object for testing.
   * @param weight - The weight value
   * @returns A Weight object
   */
  function makeWeight(weight: number): Weight {
    return {
      id: 1,
      owner: 1,
      weight,
      target_timestamp: new Date(),
      __type: 'Weight',
    }
  }

  it('returns no_weights for empty weights', () => {
    expect(calculateWeightProgress([], 80, 'cut')).toEqual({
      type: 'no_weights',
    })
  })

  it('returns progress 100 for first weight equals target weight', () => {
    const weights = [makeWeight(80)]
    expect(calculateWeightProgress(weights, 80, 'cut')).toMatchObject({
      type: 'progress',
      progress: 100,
    })
  })

  it('returns correct progress for weight loss', () => {
    const weights = [makeWeight(100), makeWeight(90)]
    const result = calculateWeightProgress(weights, 80, 'cut')
    expect(result && result.type === 'progress' && result.progress).toBeCloseTo(
      50,
      0,
    )
  })

  it('returns correct progress for weight gain', () => {
    const weights = [makeWeight(60), makeWeight(70)]
    const result = calculateWeightProgress(weights, 80, 'bulk')
    expect(result && result.type === 'progress' && result.progress).toBeCloseTo(
      50,
      0,
    )
  })

  it('returns no_change if only one weight and it does not match target', () => {
    const weights = [makeWeight(70)]
    expect(calculateWeightProgress(weights, 80, 'cut')).toMatchObject({
      type: 'no_change',
    })
  })

  it('returns progress 100 for first weight far from target and latest equals target', () => {
    const weights = [makeWeight(100), makeWeight(80)]
    expect(calculateWeightProgress(weights, 80, 'cut')).toMatchObject({
      type: 'progress',
      progress: 100,
    })
  })

  it('returns no_change for no change', () => {
    const weights = [makeWeight(100), makeWeight(100)]
    expect(calculateWeightProgress(weights, 80, 'cut')).toMatchObject({
      type: 'no_change',
    })
  })

  it('returns progress 100 for division by zero (first and target equal, multiple weights)', () => {
    const weights = [makeWeight(80), makeWeight(80)]
    expect(calculateWeightProgress(weights, 80, 'cut')).toMatchObject({
      type: 'progress',
      progress: 100,
    })
  })
})
