import { z } from 'zod'
import { mealSchema } from '@/modules/diet/meal/domain/meal'

export const dayDietSchema = z.object({
  id: z.number(),
  target_day: z.string(), // TODO: Change target_day to supabase date type
  owner: z.number(),
  meals: z.array(mealSchema),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'DayDiet' as const)
})

export type DayDiet = Readonly<z.infer<typeof dayDietSchema>>
