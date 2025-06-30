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
