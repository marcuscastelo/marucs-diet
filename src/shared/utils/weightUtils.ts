import { createMemo } from 'solid-js'

import { userWeights } from '~/modules/weight/application/weight'
import { type Weight } from '~/modules/weight/domain/weight'
import { inForceGeneric } from '~/shared/utils/generic/inForce'

function sortWeightsByDate(weights: readonly Weight[]): readonly Weight[] {
  return [...weights].sort(
    (a, b) => a.target_timestamp.getTime() - b.target_timestamp.getTime(),
  )
}

export function getFirstWeight(weights: readonly Weight[]): Weight | null {
  const sorted = sortWeightsByDate(weights)
  return sorted[0] ?? null
}

export const latestWeight = createMemo(() => getLatestWeight(userWeights()))
export function getLatestWeight(weights: readonly Weight[]): Weight | null {
  const sorted = sortWeightsByDate(weights)
  return sorted[sorted.length - 1] ?? null
}

function floatEqual(a: number, b: number, epsilon = 1e-3): boolean {
  return Math.abs(a - b) < epsilon
}

function calcDirection(end: number, start: number, precision = 1) {
  const factor = Math.pow(10, precision)
  const rounded = {
    end: Math.round(end * factor) / factor,
    start: Math.round(start * factor) / factor,
  }
  return floatEqual(rounded.end, rounded.start)
    ? ('none' as const)
    : rounded.end > rounded.start
      ? ('gain' as const)
      : ('loss' as const)
}

function getTotalAndChange(
  firstWeight: number,
  latestWeight: number,
  desiredWeight: number,
  diet: 'cut' | 'normo' | 'bulk',
) {
  let goalDirection: 'gain' | 'loss' | 'none'
  switch (diet) {
    case 'cut':
      goalDirection = 'loss'
      break
    case 'bulk':
      goalDirection = 'gain'
      break
    default:
      goalDirection = 'none'
  }
  const totalChange = latestWeight - firstWeight
  const desiredChange = desiredWeight - firstWeight
  const changeDirection = calcDirection(desiredChange, totalChange)
  return { totalChange, desiredChange, changeDirection, goalDirection }
}

export function inForceWeight(
  weights: readonly Weight[],
  date: Date,
): Weight | null {
  return inForceGeneric(weights, 'target_timestamp', date)
}

// Add calculateWeightProgress implementation for weight progress calculation
export type WeightProgressResult =
  | {
      type: 'no_weights'
    }
  | {
      type: 'progress'
      progress: number
      currentChange: { change: number; direction: 'gain' | 'loss' | 'none' }
      goalWeightChange: { change: number; direction: 'gain' | 'loss' | 'none' }
    }
  | {
      type: 'no_change'
      currentChange: { change: number; direction: 'gain' | 'loss' | 'none' }
      goalWeightChange: { change: number; direction: 'gain' | 'loss' | 'none' }
    }
  | {
      type: 'exceeded'
      exceeded: number
      currentChange: { change: number; direction: 'gain' | 'loss' | 'none' }
      goalWeightChange: { change: number; direction: 'gain' | 'loss' | 'none' }
    }
  | {
      type: 'reversal'
      reversal: number
      currentChange: { change: number; direction: 'gain' | 'loss' | 'none' }
      goalWeightChange: { change: number; direction: 'gain' | 'loss' | 'none' }
    }
  | {
      type: 'normo'
      difference: number
      direction: 'gain' | 'loss' | 'none'
      currentChange: { change: number; direction: 'gain' | 'loss' | 'none' }
      goalWeightChange: { change: number; direction: 'gain' | 'loss' | 'none' }
    }

/**
 * Calculates the user's weight progress towards a target.
 * @param weights - Array of Weight objects
 * @param desiredWeight - Target weight
 * @param diet - Diet type ('cut', 'normo', 'bulk')
 * @returns WeightProgressResult or null if invalid input
 */
export function calculateWeightProgress(
  weights: readonly Weight[],
  desiredWeight: number,
  diet: 'cut' | 'normo' | 'bulk',
): WeightProgressResult | null {
  if (weights.length === 0) {
    return {
      type: 'no_weights',
    }
  }
  const first = getFirstWeight(weights)
  const latest = getLatestWeight(weights)
  if (!first || !latest) return null
  const { goalDirection } = getTotalAndChange(
    first.weight,
    latest.weight,
    desiredWeight,
    diet,
  )
  const goalWeightChange = {
    change:
      goalDirection === 'none'
        ? 0
        : Math.round(Math.abs(desiredWeight - first.weight) * 10) / 10,
    direction: goalDirection,
  }
  const currentChange = {
    change: Math.round(Math.abs(latest.weight - first.weight) * 10) / 10,
    direction: calcDirection(latest.weight, first.weight, 1),
  }
  if (goalWeightChange.direction === 'none') {
    return {
      type: 'normo',
      difference: Math.abs(latest.weight - desiredWeight),
      direction: calcDirection(latest.weight, desiredWeight, 1),
      currentChange,
      goalWeightChange,
    }
  }
  if (goalWeightChange.change === 0 && currentChange.change === 0) {
    return {
      type: 'progress',
      progress: 100,
      currentChange,
      goalWeightChange,
    }
  }
  if (weights.length === 1 || currentChange.change === 0) {
    return {
      type: 'no_change',
      currentChange,
      goalWeightChange,
    }
  }
  if (currentChange.direction !== goalWeightChange.direction) {
    return {
      type: 'reversal',
      reversal: Math.abs(latest.weight - first.weight),
      currentChange,
      goalWeightChange,
    }
  }
  if (currentChange.change > goalWeightChange.change) {
    return {
      type: 'exceeded',
      exceeded: Math.abs(latest.weight - desiredWeight),
      currentChange,
      goalWeightChange,
    }
  }
  return {
    type: 'progress',
    progress: (currentChange.change / goalWeightChange.change) * 100,
    currentChange,
    goalWeightChange,
  }
}
