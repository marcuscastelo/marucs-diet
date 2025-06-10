// Application layer for recent food operations, migrated from legacy controller
// All error handling is done here, domain remains pure
import supabase from '~/legacy/utils/supabase'
import {
  type NewRecentFood,
  type RecentFood,
  recentFoodSchema,
} from '~/modules/recent-food/domain/recentFood'
import {
  type CreateRecentFoodDAO,
  daoToRecentFood,
  type RecentFoodDAO,
} from '~/modules/recent-food/infrastructure/recentFoodDAO'
import { handleApiError, wrapErrorWithStack } from '~/shared/error/errorHandler'
import { parseWithStack } from '~/shared/utils/parseWithStack'

const TABLE = 'recent_foods'

// TODO: Implement proper infrastructure folder for recent food

/**
 * Fetches a recent food by user, type and reference ID.
 * @param userId - The user ID.
 * @param type - The type ('food' | 'recipe').
 * @param referenceId - The reference ID (foods.id ou recipes.id).
 * @returns The recent food or null if not found.
 */
export async function fetchRecentFoodByUserTypeAndReferenceId(
  userId: RecentFood['user_id'],
  type: RecentFood['type'],
  referenceId: RecentFood['reference_id'],
) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('reference_id', referenceId)

  if (error !== null) {
    handleApiError(error, {
      component: 'recentFood',
      operation: 'fetchRecentFoodByUserTypeAndReferenceId',
      additionalData: { userId, type, referenceId },
    })
    throw wrapErrorWithStack(error)
  }

  return parseWithStack(recentFoodSchema.array(), data).at(0) ?? null
}

/**
 * Fetches all recent foods for a user.
 * @param userId - The user ID.
 * @returns Array of recent foods.
 */
export async function fetchUserRecentFoods(userId: RecentFood['user_id']) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('last_used', { ascending: false })

  if (error !== null) {
    handleApiError(error, {
      component: 'recentFood',
      operation: 'fetchUserRecentFoods',
      additionalData: { userId },
    })
    throw wrapErrorWithStack(error)
  }

  return parseWithStack(recentFoodSchema.array(), data)
}

/**
 * Inserts a new recent food.
 * @param newRecentFood - The new recent food data.
 * @returns The inserted recent food.
 */
export async function insertRecentFood(newRecentFood: NewRecentFood) {
  const createDAO: CreateRecentFoodDAO = {
    user_id: newRecentFood.user_id,
    type: newRecentFood.type,
    reference_id: newRecentFood.reference_id,
    last_used: newRecentFood.last_used,
    times_used: newRecentFood.times_used,
  }

  const { data, error } = await supabase.from(TABLE).insert(createDAO).select()

  if (error !== null) {
    handleApiError(error, {
      component: 'recentFood',
      operation: 'insertRecentFood',
      additionalData: { createDAO },
    })
    throw wrapErrorWithStack(error)
  }

  const recentFoodDAO = data[0] as RecentFoodDAO
  return daoToRecentFood(recentFoodDAO)
}

/**
 * Updates a recent food by ID.
 * @param recentFoodId - The recent food ID.
 * @param newRecentFood - The new recent food data.
 * @returns The updated recent food.
 */
export async function updateRecentFood(
  recentFoodId: RecentFood['id'],
  newRecentFood: NewRecentFood,
) {
  const updateDAO = {
    user_id: newRecentFood.user_id,
    type: newRecentFood.type,
    reference_id: newRecentFood.reference_id,
    last_used: newRecentFood.last_used,
    times_used: newRecentFood.times_used,
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(updateDAO)
    .eq('id', recentFoodId)
    .select()

  if (error !== null) {
    handleApiError(error, {
      component: 'recentFood',
      operation: 'updateRecentFood',
      additionalData: { recentFoodId, updateDAO },
    })
    throw wrapErrorWithStack(error)
  }

  const recentFoodDAO = data[0] as RecentFoodDAO
  return daoToRecentFood(recentFoodDAO)
}

/**
 * Deletes a recent food by user, type e reference_id.
 * @param userId - The user ID.
 * @param type - The type ('food' | 'recipe').
 * @param referenceId - The reference ID.
 */
export async function deleteRecentFoodByReference(
  userId: RecentFood['user_id'],
  type: RecentFood['type'],
  referenceId: RecentFood['reference_id'],
) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('type', type)
    .eq('reference_id', referenceId)

  if (error !== null) {
    handleApiError(error, {
      component: 'recentFood',
      operation: 'deleteRecentFoodByReference',
      additionalData: { userId, type, referenceId },
    })
    throw wrapErrorWithStack(error)
  }
}

export {}
