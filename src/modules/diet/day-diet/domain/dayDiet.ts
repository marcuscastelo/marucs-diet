import { z } from 'zod'

import { mealSchema } from '~/modules/diet/meal/domain/meal'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import {
  createCreatedAtField,
  createIdField,
  createNewTypeField,
  createTypeField,
  createUpdatedAtField,
  createUserIdField,
} from '~/shared/domain/schema/baseSchemas'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const dayDietSchema = z
  .object({
    id: createIdField(),
    userId: createUserIdField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
    target_day: z.string(), // TODO:   Change target_day to supabase date type
    meals: z.array(mealSchema),
    __type: createTypeField('DayDiet'),
  })
  .strip()

// Type for creating new day diets (without ID)
export const newDayDietSchema = dayDietSchema
  .omit({ id: true })
  .extend({
    __type: createNewTypeField('NewDayDiet'),
  })
  .strip()

export type DayDiet = Readonly<z.infer<typeof dayDietSchema>>
export type NewDayDiet = Readonly<z.infer<typeof newDayDietSchema>>

/**
 * Creates a NewDayDiet object for day diet creation without generating an ID
 */
export function createNewDayDiet({
  target_day: targetDay,
  userId,
  meals = [],
}: {
  target_day: string
  userId: number
  meals?: Meal[]
}): NewDayDiet {
  const now = new Date()
  return parseWithStack(newDayDietSchema, {
    target_day: targetDay,
    userId,
    meals,
    createdAt: now,
    updatedAt: now,
    __type: 'new-NewDayDiet',
  })
}
