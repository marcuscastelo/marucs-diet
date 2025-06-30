// Pure domain logic for weight evolution (no side effects)
// All functions here must be pure and not reference application or UI code
import { type Weight } from '~/modules/weight/domain/weight'

/**
 * Type for grouped weights by period.
 */
export type GroupedWeightsByPeriod = Record<string, Weight[]>

/**
 * Returns the period configuration for a given chart type.
 * @param type - Chart type string
 * @returns Object with days and count
 */
export function getCandlePeriod(type: string): { days: number; count: number } {
  switch (type) {
    case '7d':
      return { days: 1, count: 7 }
    case '14d':
      return { days: 1, count: 14 }
    case '30d':
      return { days: 1, count: 30 }
    case '6m':
      return { days: 15, count: 12 }
    case '1y':
      return { days: 30, count: 12 }
    case 'all':
      return { days: 0, count: 12 }
    default:
      return { days: 1, count: 7 }
  }
}

/**
 * Groups weights by period for charting.
 * @param weights - List of weights
 * @param type - Chart type string
 * @returns GroupedWeightsByPeriod
 */
export function groupWeightsByPeriod(
  weights: readonly Weight[],
  type: string,
): GroupedWeightsByPeriod {
  if (!weights.length) return {}
  const sorted = [...weights].sort(
    (a, b) => a.target_timestamp.getTime() - b.target_timestamp.getTime(),
  )
  if (type === 'all') {
    const firstObj = sorted[0]
    const lastObj = sorted[sorted.length - 1]
    if (!firstObj || !lastObj) return {}
    const first = firstObj.target_timestamp.getTime()
    const last = lastObj.target_timestamp.getTime()
    const totalDays = Math.max(
      1,
      Math.round((last - first) / (1000 * 60 * 60 * 24)),
    )
    const daysPerCandle = Math.max(1, Math.round(totalDays / 12))
    const result: Record<string, Weight[]> = {}
    for (let i = 0; i < 12; i++) {
      const start = new Date(first + i * daysPerCandle * 24 * 60 * 60 * 1000)
      const end = new Date(
        first + (i + 1) * daysPerCandle * 24 * 60 * 60 * 1000,
      )
      const key = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
      result[key] = sorted.filter(
        (w) => w.target_timestamp >= start && w.target_timestamp < end,
      )
    }
    return result
  }
  const { days, count } = getCandlePeriod(type)
  const lastObj = sorted[sorted.length - 1]
  if (!lastObj) return {}
  const last = lastObj.target_timestamp
  const result: Record<string, Weight[]> = {}
  for (let i = count - 1; i >= 0; i--) {
    let start: Date, end: Date
    if (days === 1) {
      start = new Date(last)
      start.setDate(start.getDate() - i)
      end = new Date(start)
      end.setDate(end.getDate() + 1)
    } else {
      start = new Date(last)
      start.setDate(start.getDate() - i * days)
      end = new Date(start)
      end.setDate(end.getDate() + days)
    }
    const key = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
    result[key] = sorted.filter(
      (w) => w.target_timestamp >= start && w.target_timestamp < end,
    )
  }
  return result
}

/**
 * Calculates the moving average for a data array.
 * @param data - Array of objects with a low property
 * @param window - Window size
 * @returns Array of moving averages
 */
export function calculateMovingAverage(
  data: readonly { low: number }[],
  window: number = 7,
): number[] {
  return data.map((_, index) => {
    const weights = data.slice(Math.max(0, index - window), index + 1)
    return weights.reduce((acc, weight) => acc + weight.low, 0) / weights.length
  })
}

/**
 * Advanced data decimation strategy for chart virtualization.
 * Uses Largest-Triangle-Three-Buckets algorithm for optimal point selection.
 * @param weights - Array of weights
 * @param targetPoints - Target number of points
 * @returns Decimated weight array
 */
export function decimateWeightData(
  weights: readonly Weight[],
  targetPoints: number,
): Weight[] {
  if (weights.length <= targetPoints) {
    return [...weights]
  }

  const sorted = [...weights].sort(
    (a, b) => a.target_timestamp.getTime() - b.target_timestamp.getTime(),
  )

  // Use simplified LTTB algorithm for data decimation
  const bucketSize = (sorted.length - 2) / (targetPoints - 2)
  const firstWeight = sorted[0]
  if (!firstWeight) return []

  const decimated: Weight[] = [firstWeight] // Always include first point

  for (let i = 1; i < targetPoints - 1; i++) {
    const bucketStart = Math.floor(i * bucketSize) + 1
    const bucketEnd = Math.floor((i + 1) * bucketSize) + 1
    const bucket = sorted.slice(bucketStart, Math.min(bucketEnd, sorted.length))

    if (bucket.length === 0) continue

    // Find point with largest triangle area (simplified)
    let maxArea = 0
    let selectedPoint = bucket[0]

    for (const point of bucket) {
      const prevWeight = sorted[bucketStart - 1]
      if (prevWeight) {
        // Calculate area using weight as the primary metric
        const area = Math.abs(point.weight - prevWeight.weight)
        if (area > maxArea) {
          maxArea = area
          selectedPoint = point
        }
      }
    }

    if (selectedPoint) {
      decimated.push(selectedPoint)
    }
  }

  // Always include last point
  const lastWeight = sorted[sorted.length - 1]
  if (lastWeight) {
    decimated.push(lastWeight)
  }

  return decimated
}

/**
 * Optimizes weight dataset for mobile devices by reducing data points.
 * @param weights - Array of weights
 * @param isMobile - Whether device is mobile
 * @param maxPoints - Maximum points for mobile
 * @returns Optimized weight array
 */
export function optimizeWeightsForMobile(
  weights: readonly Weight[],
  isMobile: boolean,
  maxPoints: number = 50,
): Weight[] {
  if (!isMobile || weights.length <= maxPoints) {
    return [...weights]
  }

  // Use advanced decimation for very large datasets
  if (weights.length > 200) {
    return decimateWeightData(weights, maxPoints)
  }

  // For smaller datasets, use simple sampling
  const step = Math.ceil(weights.length / maxPoints)
  const sampled: Weight[] = []

  for (let i = 0; i < weights.length; i += step) {
    const weight = weights[i]
    if (weight) {
      sampled.push(weight)
    }
  }

  // Always include the last weight for accurate current state
  const lastWeight = weights[weights.length - 1]
  if (lastWeight && sampled[sampled.length - 1] !== lastWeight) {
    sampled.push(lastWeight)
  }

  return sampled
}
