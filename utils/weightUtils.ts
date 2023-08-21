import { Weight } from '@/model/weightModel'

export function latestWeight(weights: Weight[]) {
  if (weights.length === 0) {
    return null
  }
  return weights[weights.length - 1]
}
