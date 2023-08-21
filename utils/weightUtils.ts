import { Weight } from '@/model/weightModel'

export function latestWeight(weights: Weight[]) {
  return weights[weights.length - 1]
}
