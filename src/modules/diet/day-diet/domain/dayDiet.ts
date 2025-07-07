import { z } from 'zod/v4'

import { mealSchema } from '~/modules/diet/meal/domain/meal'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import { createZodEntity } from '~/shared/domain/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

const ze = createZodEntity('dayDiet')

export const dayDietSchema = ze.create({
  id: ze.number('id'),
  target_day: ze.string('target_day'), // TODO:   Change target_day to supabase date type
  owner: ze.number('owner'),
  meals: ze.array('meals', mealSchema),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'DayDiet' as const),
})

// Type for creating new day diets (without ID)
export const newDayDietSchema = ze.create({
  target_day: ze.string('target_day'),
  owner: ze.number('owner'),
  meals: ze.array('meals', mealSchema),
  __type: z.literal('NewDayDiet'),
})

export type DayDiet = Readonly<z.infer<typeof dayDietSchema>>
export type NewDayDiet = Readonly<z.infer<typeof newDayDietSchema>>

/**
 * Creates a NewDayDiet object for day diet creation without generating an ID
 */
export function createNewDayDiet({
  target_day: targetDay,
  owner,
  meals = [],
}: {
  target_day: string
  owner: number
  meals?: Meal[]
}): NewDayDiet {
  return parseWithStack(newDayDietSchema, {
    target_day: targetDay,
    owner,
    meals,
    __type: 'NewDayDiet',
  })
}
