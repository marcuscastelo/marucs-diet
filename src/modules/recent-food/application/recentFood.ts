// Application layer for recent food operations, migrated from legacy controller
// All error handling is done here, domain remains pure
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
import { showPromise } from '~/modules/toast/application/toastManager'
import env from '~/shared/config/env'
import { handleApiError } from '~/shared/error/errorHandler'
import { parseWithStack } from '~/shared/utils/parseWithStack'
import supabase from '~/shared/utils/supabase'

const TABLE = 'recent_foods'

// TODO: Implement proper infrastructure folder for recent food

/**
 * Fetches a recent food by user, type and reference ID.
 * @param userId - The user ID.
 * @param type - The type ('food' | 'recipe').
 * @param referenceId - The reference ID (foods.id ou recipes.id).
 * @returns The recent food or null if not found or on error.
 */
export async function fetchRecentFoodByUserTypeAndReferenceId(
  userId: RecentFood['user_id'],
  type: RecentFood['type'],
  referenceId: RecentFood['reference_id'],
): Promise<RecentFood | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('reference_id', referenceId)
    if (error !== null) throw error
    return parseWithStack(recentFoodSchema.array(), data).at(0) ?? null
  } catch (error) {
    handleApiError(error)
    return null
  }
}

/**
 * Fetches recent foods for a user with optional limit for performance optimization.
 * @param userId - The user ID.
 * @param limit - Maximum number of recent foods to fetch (defaults to environment configuration).
 * @returns Array of recent foods or empty array on error.
 */
export async function fetchUserRecentFoods(
  userId: RecentFood['user_id'],
  limit: number = env.VITE_RECENT_FOODS_DEFAULT_LIMIT,
): Promise<readonly RecentFood[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('last_used', { ascending: false })
      .limit(limit)
    if (error !== null) throw error
    return parseWithStack(recentFoodSchema.array(), data)
  } catch (error) {
    handleApiError(error)
    return []
  }
}

/**
 * Inserts a new recent food.
 * @param newRecentFood - The new recent food data.
 * @returns The inserted recent food or null on error.
 */
export async function insertRecentFood(
  newRecentFood: NewRecentFood,
): Promise<RecentFood | null> {
  try {
    return await showPromise(
      (async () => {
        const createDAO: CreateRecentFoodDAO = {
          user_id: newRecentFood.user_id,
          type: newRecentFood.type,
          reference_id: newRecentFood.reference_id,
          last_used: newRecentFood.last_used,
          times_used: newRecentFood.times_used,
        }
        const { data, error } = await supabase
          .from(TABLE)
          .insert(createDAO)
          .select()
        if (error !== null) throw error
        const recentFoodDAO = data[0] as RecentFoodDAO
        return daoToRecentFood(recentFoodDAO)
      })(),
      {
        loading: 'Salvando alimento recente...',
        success: 'Alimento recente salvo com sucesso',
        error: 'Erro ao salvar alimento recente',
      },
      { context: 'user-action', audience: 'user' },
    )
  } catch (error) {
    handleApiError(error)
    return null
  }
}

/**
 * Updates a recent food by ID.
 * @param recentFoodId - The recent food ID.
 * @param newRecentFood - The new recent food data.
 * @returns The updated recent food or null on error.
 */
export async function updateRecentFood(
  recentFoodId: RecentFood['id'],
  newRecentFood: NewRecentFood,
): Promise<RecentFood | null> {
  try {
    return await showPromise(
      (async () => {
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
        if (error !== null) throw error
        const recentFoodDAO = data[0] as RecentFoodDAO
        return daoToRecentFood(recentFoodDAO)
      })(),
      {
        loading: 'Atualizando alimento recente...',
        success: 'Alimento recente atualizado com sucesso',
        error: 'Erro ao atualizar alimento recente',
      },
      { context: 'user-action', audience: 'user' },
    )
  } catch (error) {
    handleApiError(error)
    return null
  }
}

/**
 * Deletes a recent food by user, type e reference_id.
 * @param userId - The user ID.
 * @param type - The type ('food' | 'recipe').
 * @param referenceId - The reference ID.
 * @returns True if deleted, false otherwise.
 */
export async function deleteRecentFoodByReference(
  userId: RecentFood['user_id'],
  type: RecentFood['type'],
  referenceId: RecentFood['reference_id'],
): Promise<boolean> {
  try {
    await showPromise(
      (async () => {
        const { error } = await supabase
          .from(TABLE)
          .delete()
          .eq('user_id', userId)
          .eq('type', type)
          .eq('reference_id', referenceId)
        if (error !== null) throw error
      })(),
      {
        loading: 'Removendo alimento recente...',
        success: 'Alimento recente removido com sucesso',
        error: 'Erro ao remover alimento recente',
      },
      { context: 'user-action', audience: 'user' },
    )
    return true
  } catch (error) {
    handleApiError(error)
    return false
  }
}

export {}
