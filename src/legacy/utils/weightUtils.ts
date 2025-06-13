import { createMemo } from 'solid-js'

import { inForceGeneric } from '~/legacy/utils/generic/inForce'
import { userWeights } from '~/modules/weight/application/weight'
import { type Weight } from '~/modules/weight/domain/weight'

function sortWeightsByDate(weights: readonly Weight[]): readonly Weight[] {
  return [...weights].sort(
    (a, b) => a.target_timestamp.getTime() - b.target_timestamp.getTime(),
  )
}

export function firstWeight(weights: readonly Weight[]) {
  const sorted = sortWeightsByDate(weights)
  if (sorted.length === 0) {
    return null
  }
  return sorted[0] ?? null
}

export function getLatestWeight(weights: readonly Weight[]) {
  const sorted = sortWeightsByDate(weights)
  if (sorted.length === 0) {
    return null
  }
  return sorted[sorted.length - 1] ?? null
}

// Reactive signal that returns the latest weight from userWeights
export const latestWeight = createMemo(() => {
  const weights = userWeights()
  if (weights.length === 0) {
    return null
  }
  return weights[weights.length - 1]
})

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
  diet: 'cut' | 'normo' | 'bulk' = 'cut',
) {
  if (weights.length === 0) {
    return null
  }
  if (weights.length === 1) {
    const first = firstWeight(weights)
    if (first && first.weight === desiredWeight) {
      return 0
    }
    return null
  }
  const first = firstWeight(weights)
  const latest = getLatestWeight(weights)
  if (!first || !latest) {
    return null
  }
  // Handle edge case: if direction of goal is inverted, swap logic
  let effectiveDiet = diet
  if (diet === 'cut' && desiredWeight > first.weight) {
    effectiveDiet = 'bulk'
  } else if (diet === 'bulk' && desiredWeight < first.weight) {
    effectiveDiet = 'cut'
  }
  // Para cutting, progresso positivo = perdeu peso em direção à meta
  // Para bulking, progresso positivo = ganhou peso em direção à meta
  // Para normo, usar lógica de aproximação
  let totalChange = desiredWeight - first.weight
  let change = latest.weight - first.weight
  if (effectiveDiet === 'bulk') {
    totalChange = desiredWeight - first.weight
    change = latest.weight - first.weight
  } else if (effectiveDiet === 'cut') {
    totalChange = first.weight - desiredWeight
    change = first.weight - latest.weight
  } else {
    // normo: progresso é a aproximação do peso inicial ao desejado
    totalChange = Math.abs(desiredWeight - first.weight)
    change = Math.abs(latest.weight - first.weight)
  }
  if (totalChange === 0) {
    // If already at target, progress is 1 if latest == desired, else 0 if unchanged, else >1 if passed
    if (latest.weight === desiredWeight) return 0
    if (
      (effectiveDiet === 'cut' && latest.weight < desiredWeight) ||
      (effectiveDiet === 'bulk' && latest.weight > desiredWeight)
    ) {
      return change + 1 // >100%
    }
    if (latest.weight === first.weight) return 0
    return 0
  }
  const percentageChange = change / totalChange
  return percentageChange
}

export function inForceWeight(weights: readonly Weight[], date: Date) {
  return inForceGeneric(weights, 'target_timestamp', date)
}
