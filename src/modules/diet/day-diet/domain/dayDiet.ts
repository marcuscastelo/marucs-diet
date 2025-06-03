import { z } from 'zod'
import { mealSchema } from '~/modules/diet/meal/domain/meal'
import { type Meal } from '~/modules/diet/meal/domain/meal'

export const dayDietSchema = z.object({
  id: z.number(),
  targetDay: z.string(), // TODO:   Change target_day to supabase date type
  owner: z.number(),
  meals: z.array(mealSchema),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'DayDiet' as const),
})

// Type for creating new day diets (without ID)
export const newDayDietSchema = z.object({
  targetDay: z.string(),
  owner: z.number(),
  meals: z.array(mealSchema),
  __type: z.literal('NewDayDiet'),
})

export type DayDiet = Readonly<z.infer<typeof dayDietSchema>>
export type NewDayDiet = Readonly<z.infer<typeof newDayDietSchema>>

/**
 * Creates a NewDayDiet object for day diet creation without generating an ID
 */
export function createNewDayDiet({
  targetDay,
  owner,
  meals = [],
}: {
  targetDay: string
  owner: number
  meals?: Meal[]
}): NewDayDiet {
  return newDayDietSchema.parse({
    target_day: targetDay,
    owner,
    meals,
    __type: 'NewDayDiet',
  })
}

export function demoteToNewDayDiet(dayDiet: DayDiet): NewDayDiet {
  return newDayDietSchema.parse({
    target_day: dayDiet.targetDay,
    owner: dayDiet.owner,
    meals: dayDiet.meals,
    __type: 'NewDayDiet',
  })
}
