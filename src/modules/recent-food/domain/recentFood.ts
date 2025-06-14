import { z } from 'zod'

import { parseWithStack } from '~/shared/utils/parseWithStack'

export const recentFoodSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  type: z.enum(['food', 'recipe']),
  reference_id: z.number(),
  last_used: z
    .date()
    .or(z.string())
    .transform((v) => new Date(v)),
  times_used: z.number(),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'RecentFood' as const),
})

// Schema for creating a new recent food (without ID)
export const newRecentFoodSchema = z.object({
  user_id: z.number(),
  type: z.enum(['food', 'recipe']),
  reference_id: z.number(),
  last_used: z.date().default(() => new Date()),
  times_used: z.number().default(1),
  __type: z.literal('NewRecentFood'),
})

export type RecentFood = Readonly<z.infer<typeof recentFoodSchema>>
export type NewRecentFood = Readonly<z.infer<typeof newRecentFoodSchema>>
export type RecentFoodCreationParams = Partial<RecentFood> &
  Pick<RecentFood, 'user_id' | 'type' | 'reference_id'>

/**
 * Creates a new recent food record
 */
export function createNewRecentFood(
  params: RecentFoodCreationParams,
): NewRecentFood {
  return parseWithStack(newRecentFoodSchema, {
    user_id: params.user_id,
    type: params.type,
    reference_id: params.reference_id,
    last_used: new Date(),
    times_used: (params.times_used ?? 0) + 1,
    __type: 'NewRecentFood',
  })
}

export function demoteToNewRecentFood(recentFood: RecentFood): NewRecentFood {
  return parseWithStack(newRecentFoodSchema, {
    user_id: recentFood.user_id,
    type: recentFood.type,
    reference_id: recentFood.reference_id,
    last_used: recentFood.last_used,
    times_used: recentFood.times_used,
    __type: 'NewRecentFood',
  })
}
