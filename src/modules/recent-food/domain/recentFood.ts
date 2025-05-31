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

// Schema for creating a new recent food (without ID)
export const newRecentFoodSchema = z.object({
  user_id: z.number(),
  food_id: z.number(),
  last_used: z.date().default(() => new Date()),
  times_used: z.number().default(1),
})

export type RecentFood = Readonly<z.infer<typeof recentFoodSchema>>
export type NewRecentFood = Readonly<z.infer<typeof newRecentFoodSchema>>
export type RecentFoodCreationParams = Partial<RecentFood> &
  Pick<RecentFood, 'user_id' | 'food_id'>

/**
 * Creates a new recent food record
 */
export function createNewRecentFood(
  params: RecentFoodCreationParams,
): NewRecentFood {
  return newRecentFoodSchema.parse({
    user_id: params.user_id,
    food_id: params.food_id,
    last_used: new Date(),
    times_used: (params.times_used ?? 0) + 1,
  })
}
