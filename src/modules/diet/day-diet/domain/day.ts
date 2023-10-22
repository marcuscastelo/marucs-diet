import { z } from 'zod'
import { mealSchema } from '@/src/modules/diet/meal/domain/meal'
import { New, enforceNew } from '@/legacy/utils/newDbRecord'

export const dayDietSchema = z.object({
  id: z.number(),
  target_day: z.string(), // TODO: retriggered: use supabase date type
  owner: z.number(),
  meals: z.array(mealSchema),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'DayDiet' as const),
})

export type DayDiet = Readonly<z.infer<typeof dayDietSchema>>

// TODO: Make createDay function more than a mock
export function createDay({
  target_day: targetDay,
  owner,
  meals = [],
}: {
  target_day: string
  owner: number
  meals?: DayDiet['meals']
}): New<DayDiet> {
  return enforceNew(
    dayDietSchema.parse({
      id: 0,
      target_day: targetDay,
      owner,
      meals,
      __type: 'DayDiet',
    } satisfies DayDiet),
  )
}
