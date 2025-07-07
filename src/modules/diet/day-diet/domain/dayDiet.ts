import { z } from 'zod'

import { mealSchema } from '~/modules/diet/meal/domain/meal'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import {
  createNewTypeField,
  createTypeField,
  entityBaseSchema,
  ownedEntityBaseSchema,
} from '~/shared/domain/schema/baseSchemas'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const dayDietSchema = entityBaseSchema
  .merge(ownedEntityBaseSchema)
  .extend({
    target_day: z.string(), // TODO:   Change target_day to supabase date type
    meals: z.array(mealSchema),
    __type: createTypeField('DayDiet'),
  })

// Type for creating new day diets (without ID)
export const newDayDietSchema = ownedEntityBaseSchema.extend({
  target_day: z.string(),
  meals: z.array(mealSchema),
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
