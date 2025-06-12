import { createMemo } from 'solid-js'

import { inForceGeneric } from '~/legacy/utils/generic/inForce'
import { userWeights } from '~/modules/weight/application/weight'
import { type Weight } from '~/modules/weight/domain/weight'

export function getLatestWeight(weights: readonly Weight[]) {
  if (weights.length === 0) {
    return null
  }
  return weights[weights.length - 1] ?? null
}

// Reactive signal that returns the latest weight from userWeights
export const latestWeight = createMemo(() => {
  const weights = userWeights()
  if (weights.length === 0) {
    return null
  }
  return weights[weights.length - 1]
})

export function firstWeight(weights: readonly Weight[]) {
  if (weights.length === 0) {
    return null
  }
  return weights[0] ?? null
}

export function calculateWeightChange(weights: readonly Weight[]) {
  const first = firstWeight(weights)
  if (first === null) {
    return null
  }

  const latest = getLatestWeight(weights)
  if (latest === null) {
    return null
  }

  return latest.weight - first.weight
}

export function calculateWeightProgress(
  weights: readonly Weight[],
  desiredWeight: number,
) {
  const change = calculateWeightChange(weights)
  if (change === null) {
    return null
  }

  const first = firstWeight(weights)
  if (first === null) {
    return null
  }

  const totalChange = desiredWeight - first.weight // 100 - 101 = -1
  const percentageChange = change / totalChange // 0 / -1 = 0
  return percentageChange // 0
}

export function inForceWeight(weights: readonly Weight[], date: Date) {
  return inForceGeneric(weights, 'target_timestamp', date)
}
