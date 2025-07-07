import { z } from 'zod/v4'

import { mealSchema } from '~/modules/diet/meal/domain/meal'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import {
  createIdField,
  createMealsField,
  createNewTypeField,
  createOwnerField,
  createTypeField,
} from '~/shared/domain/commonFields'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const dayDietSchema = z.object({
  id: createIdField('dayDiet'),
  target_day: z.string(), // TODO:   Change target_day to supabase date type
  owner: createOwnerField('dayDiet'),
  meals: createMealsField('dayDiet', mealSchema),
  __type: createTypeField('DayDiet' as const),
})

// Type for creating new day diets (without ID)
export const newDayDietSchema = z.object({
  target_day: z.string(),
  owner: createOwnerField('dayDiet'),
  meals: createMealsField('dayDiet', mealSchema),
  __type: createNewTypeField('NewDayDiet'),
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
