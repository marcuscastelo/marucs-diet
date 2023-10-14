import { Measure } from '@/modules/measure/domain/measure'
import { User } from '@/modules/user/domain/user'
import { Weight } from '@/modules/weight/domain/weight'
import { z } from 'zod'

export type BodyFatInput<T extends User['gender']> = {
  gender: T
  weight: Weight['weight']
  waist: Measure['waist']
  neck: Measure['neck']
  hip: T extends 'male' ? Measure['hip'] : NonNullable<Measure['hip']>
  height: Measure['height']
}

export function calculateBodyFat<T extends User['gender']>(
  input: BodyFatInput<T>,
) {
  if (input.gender === 'male')
    return calculateMaleBodyFat({
      ...input,
      gender: 'male',
    })
  else
    return calculateFemaleBodyFat({
      ...input,
      gender: 'female',
      hip: z.number().parse(input.hip),
    })
}

/*
BFP =	
495
1.0324 - 0.19077×log10(waist-neck) + 0.15456×log10(height)
- 450
 */
function calculateMaleBodyFat(input: BodyFatInput<'male'>) {
  const k1 = 1.0324
  const k2 = 0.19077
  const l2 = Math.log10(input.waist - input.neck)
  const k3 = 0.15456
  const l3 = Math.log10(input.height)

  return 495 / (k1 - k2 * l2 + k3 * l3) - 450
}

/*
BFP =	
495
1.29579 - 0.35004×log10(waist+hip-neck) + 0.22100×log10(height)
- 450
*/
function calculateFemaleBodyFat(input: BodyFatInput<'female'>) {
  const k1 = 1.29579
  const k2 = 0.35004
  const l2 = Math.log10(input.waist + input.hip - input.neck)
  const k3 = 0.221
  const l3 = Math.log10(input.height)

  return 495 / (k1 - k2 * l2 + k3 * l3) - 450
}
