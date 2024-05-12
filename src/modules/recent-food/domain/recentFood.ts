import { type DbReady } from '~/legacy/utils/newDbRecord'
import { z } from 'zod'

export const recentFoodSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  food_id: z.number(),
  last_used: z
    .date()
    .or(z.string())
    .transform((v) => new Date(v)),
  times_used: z.number(),
})

export type RecentFood = Readonly<z.infer<typeof recentFoodSchema>>
export type RecentFoodCreationParams = Partial<RecentFood> &
  Pick<RecentFood, 'user_id' | 'food_id'>

// TODO: Unit test createRecentFood
export function createRecentFood(
  recentFood: RecentFoodCreationParams,
): DbReady<RecentFood> {
  return recentFoodSchema.omit({ id: true }).parse({
    last_used: new Date(),
    times_used: (recentFood.times_used ?? 0) + 1,
    ...recentFood,
  } satisfies DbReady<RecentFood>)
}
