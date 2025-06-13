import { createMemo } from 'solid-js'

import { inForceGeneric } from '~/legacy/utils/generic/inForce'
import { userWeights } from '~/modules/weight/application/weight'
import { type Weight } from '~/modules/weight/domain/weight'

function sortWeightsByDate(weights: readonly Weight[]): readonly Weight[] {
  return [...weights].sort(
    (a, b) => a.target_timestamp.getTime() - b.target_timestamp.getTime(),
  )
}

export function getFirstWeight(weights: readonly Weight[]) {
  const sorted = sortWeightsByDate(weights)
  return sorted[0] ?? null
}

export const latestWeight = createMemo(() => getLatestWeight(userWeights()))
export function getLatestWeight(weights: readonly Weight[]) {
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
    case 'normo':
      goalDirection = 'none'
      break
    default:
      diet satisfies never
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unknown diet type: ${diet}`)
  }

  return {
    goalWeightChange: {
      change:
        goalDirection === 'none'
          ? 0
          : Math.round(Math.abs(desiredWeight - firstWeight) * 10) / 10,
      direction: goalDirection,
    },
    currentChange: {
      change: Math.round(Math.abs(latestWeight - firstWeight) * 10) / 10,
      direction: calcDirection(latestWeight, firstWeight),
    },
  }
}

export function calculateWeightProgress(
  weights: readonly Weight[],
  desiredWeight: number,
  diet: 'cut' | 'normo' | 'bulk',
) {
  if (weights.length === 0) {
    return {
      type: 'no_weights' as const,
    }
  }
  const first = getFirstWeight(weights)
  const latest = getLatestWeight(weights)
  if (!first || !latest) return null
  const { goalWeightChange, currentChange } = getTotalAndChange(
    first.weight,
    latest.weight,
    desiredWeight,
    diet,
  )

  if (goalWeightChange.direction === 'none') {
    return {
      type: 'normo' as const,
      difference: Math.abs(latest.weight - desiredWeight),
      direction: calcDirection(latest.weight, desiredWeight, 1),
      currentChange,
      goalWeightChange,
    }
  }

  if (goalWeightChange.change === 0) {
    return {
      type: 'progress' as const,
      progress: 100,
      currentChange,
      goalWeightChange,
    }
  }

  if (weights.length === 1 || currentChange.change === 0) {
    return {
      type: 'no_change' as const,
      currentChange,
      goalWeightChange,
    }
  }

  if (currentChange.direction !== goalWeightChange.direction) {
    return {
      type: 'reversal' as const,
      currentChange,
      goalWeightChange,
    }
  }

  if (currentChange.change > goalWeightChange.change) {
    return {
      type: 'exceeded' as const,
      exceeded: Math.abs(goalWeightChange.change - currentChange.change),
      currentChange,
      goalWeightChange,
    }
  }

  return {
    type: 'progress' as const,
    progress: (currentChange.change / goalWeightChange.change) * 100,
    currentChange,
    goalWeightChange,
  }
}

export function inForceWeight(weights: readonly Weight[], date: Date) {
  return inForceGeneric(weights, 'target_timestamp', date)
}
