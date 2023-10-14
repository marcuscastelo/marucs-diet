import { z } from 'zod'
import { mealSchema } from '@/legacy/model/mealModel'
import { New, enforceNew } from '../utils/newDbRecord'

export const daySchema = z.object({
  id: z.number(),
  target_day: z.string(), // TODO: retriggered: use supabase date type
  owner: z.number(),
  meals: z.array(mealSchema),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'Day' as const),
})

export type Day = Readonly<z.infer<typeof daySchema>>

// TODO: Make createDay function more than a mock
export function createDay({
  target_day: targetDay,
  owner,
  meals = [],
}: {
  target_day: string
  owner: number
  meals?: Day['meals']
}): New<Day> {
  return enforceNew(
    daySchema.parse({
      id: 0,
      target_day: targetDay,
      owner,
      meals,
      __type: 'Day',
    } satisfies Day),
  )
}
