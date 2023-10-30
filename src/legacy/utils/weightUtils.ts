import { Weight } from '@/modules/weight/domain/weight'
import { inForceGeneric } from '@/legacy/utils/generic/inForce'

export function latestWeight(weights: readonly Weight[]) {
  if (weights.length === 0) {
    return null
  }
  return weights[weights.length - 1]
}

export function firstWeight(weights: readonly Weight[]) {
  if (weights.length === 0) {
    return null
  }
  return weights[0]
}

export function calculateWeightChange(weights: readonly Weight[]) {
  const first = firstWeight(weights)
  if (first === null) {
    return null
  }

  const latest = latestWeight(weights)
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
