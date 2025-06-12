import { z } from 'zod'

import {
  type RecentFood,
  recentFoodSchema,
} from '~/modules/recent-food/domain/recentFood'
import { parseWithStack } from '~/shared/utils/parseWithStack'

// DAO schema for creating new recent food
export const createRecentFoodDAOSchema = z.object({
  user_id: z.number(),
  type: z.enum(['food', 'recipe']),
  reference_id: z.number(),
  last_used: z.date(),
  times_used: z.number(),
})

// DAO schema for updating existing recent food
export const updateRecentFoodDAOSchema = z.object({
  id: z.number(),
  user_id: z.number().optional(),
  type: z.enum(['food', 'recipe']).optional(),
  reference_id: z.number().optional(),
  last_used: z.date().optional(),
  times_used: z.number().optional(),
})

// DAO schema for database record
export const recentFoodDAOSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  type: z.enum(['food', 'recipe']),
  reference_id: z.number(),
  last_used: z.date(),
  times_used: z.number(),
})

export type CreateRecentFoodDAO = z.infer<typeof createRecentFoodDAOSchema>
export type UpdateRecentFoodDAO = z.infer<typeof updateRecentFoodDAOSchema>
export type RecentFoodDAO = z.infer<typeof recentFoodDAOSchema>

/**
 * Converts a domain RecentFood object to a DAO object for database storage
 */
export function recentFoodToDAO(recentFood: RecentFood): RecentFoodDAO {
  return {
    id: recentFood.id,
    user_id: recentFood.user_id,
    type: recentFood.type,
    reference_id: recentFood.reference_id,
    last_used: recentFood.last_used,
    times_used: recentFood.times_used,
  }
}

/**
 * Converts a DAO object from database to domain RecentFood object
 */
export function daoToRecentFood(dao: RecentFoodDAO): RecentFood {
  return parseWithStack(recentFoodSchema, {
    id: dao.id,
    user_id: dao.user_id,
    type: dao.type,
    reference_id: dao.reference_id,
    last_used: dao.last_used,
    times_used: dao.times_used,
  })
}

/**
 * Converts CreateRecentFoodDAO to RecentFoodDAO for database operations
 */
export function createRecentFoodDAOToDAO(
  createDAO: CreateRecentFoodDAO,
  id: number,
): RecentFoodDAO {
  return parseWithStack(recentFoodDAOSchema, {
    id,
    user_id: createDAO.user_id,
    type: createDAO.type,
    reference_id: createDAO.reference_id,
    last_used: createDAO.last_used,
    times_used: createDAO.times_used,
  })
}

/**
 * Merges UpdateRecentFoodDAO with existing RecentFoodDAO for database updates
 */
export function mergeUpdateRecentFoodDAO(
  existing: RecentFoodDAO,
  update: UpdateRecentFoodDAO,
): RecentFoodDAO {
  return parseWithStack(recentFoodDAOSchema, {
    ...existing,
    ...update,
  })
}
