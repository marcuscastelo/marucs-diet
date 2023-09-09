import { Weight } from '@/model/weightModel'

export function latestWeight(weights: Weight[]) {
  if (weights.length === 0) {
    return null
  }
  return weights[weights.length - 1]
}

export function firstWeight(weights: Weight[]) {
  if (weights.length === 0) {
    return null
  }
  return weights[0]
}

export function calculateWeightChange(weights: Weight[]) {
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
  weights: Weight[],
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
