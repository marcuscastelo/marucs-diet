// Application layer for recent food operations, migrated from legacy controller
// All error handling is done here, domain remains pure
import { foodSchema } from '~/modules/diet/food/domain/food'
import { recipeSchema } from '~/modules/diet/recipe/domain/recipe'
import {
  createRecentTemplate,
  type NewRecentFood,
  type RecentFood,
  recentFoodSchema,
  type RecentTemplate,
  recentTemplateSchema,
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
import { removeDiacritics } from '~/shared/utils/removeDiacritics'
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
 * Fetches recent foods for a user with optional limit and search filtering.
 * When search is provided, uses server-side search with joined food/recipe names for efficiency.
 * @param userId - The user ID.
 * @param limit - Maximum number of recent foods to fetch (defaults to environment configuration).
 * @param search - Optional search term to filter by food/recipe names (case and diacritic insensitive).
 * @returns Array of recent foods or empty array on error.
 */
export async function fetchUserRecentFoods(
  userId: RecentFood['user_id'],
  limit: number = env.VITE_RECENT_FOODS_DEFAULT_LIMIT,
  search?: string,
): Promise<readonly RecentFood[]> {
  try {
    // If search is provided, use server-side search function for efficiency
    if (search !== undefined && search.trim() !== '') {
      const normalizedSearch = removeDiacritics(search.trim())
      const response = await supabase.rpc('search_recent_foods_with_names', {
        p_user_id: userId,
        p_search_term: normalizedSearch,
        p_limit: limit,
      })
      if (response.error !== null) throw response.error

      // Transform the joined result back to RecentFood schema (excluding the name field)
      const recentFoodsData = (response.data as unknown[]).map(
        (row: unknown) => {
          const typedRow = row as {
            recent_food_id: number
            user_id: number
            type: string
            reference_id: number
            last_used: string | Date
            times_used: number
          }
          return {
            id: typedRow.recent_food_id,
            user_id: typedRow.user_id,
            type: typedRow.type,
            reference_id: typedRow.reference_id,
            last_used: typedRow.last_used,
            times_used: typedRow.times_used,
          }
        },
      )

      return parseWithStack(recentFoodSchema.array(), recentFoodsData)
    }

    // No search - use existing direct table query for optimal performance
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
 * Fetches recent templates (complete Template objects with usage metadata) for a user.
 * Uses the enhanced database function to return complete Template objects directly.
 * @param userId - The user ID.
 * @param limit - Maximum number of recent templates to fetch (defaults to environment configuration).
 * @param search - Optional search term to filter by food/recipe names (case and diacritic insensitive).
 * @returns Array of recent templates or empty array on error.
 */
export async function fetchUserRecentTemplates(
  userId: RecentFood['user_id'],
  limit: number = env.VITE_RECENT_FOODS_DEFAULT_LIMIT,
  search?: string,
): Promise<readonly RecentTemplate[]> {
  try {
    const normalizedSearch =
      search?.trim() !== undefined && search.trim() !== ''
        ? removeDiacritics(search.trim())
        : undefined
    const response = await supabase.rpc('search_recent_foods_with_names', {
      p_user_id: userId,
      p_search_term: normalizedSearch ?? null,
      p_limit: limit,
    })
    if (response.error !== null) throw response.error

    // Transform the enhanced result to RecentTemplate objects
    const recentTemplates = (response.data as unknown[]).map((row: unknown) => {
      const typedRow = row as {
        recent_food_id: number
        user_id: number
        type: string
        reference_id: number
        last_used: string | Date
        times_used: number
        template_id: number
        template_name: string
        template_ean: string | null
        template_source: unknown
        template_macros: unknown
        template_owner: number | null
        template_items: unknown
        template_prepared_multiplier: number | null
      }

      // Create the appropriate Template object based on type
      if (typedRow.type === 'food') {
        const foodTemplate = parseWithStack(foodSchema, {
          id: typedRow.template_id,
          name: typedRow.template_name,
          ean: typedRow.template_ean,
          source: typedRow.template_source,
          macros: typedRow.template_macros,
          __type: 'Food',
        })
        return createRecentTemplate(
          foodTemplate,
          typedRow.recent_food_id,
          new Date(typedRow.last_used),
          typedRow.times_used,
        )
      } else {
        const recipeTemplate = parseWithStack(recipeSchema, {
          id: typedRow.template_id,
          name: typedRow.template_name,
          owner: typedRow.template_owner!,
          items: typedRow.template_items,
          prepared_multiplier: typedRow.template_prepared_multiplier!,
          __type: 'Recipe',
        })
        return createRecentTemplate(
          recipeTemplate,
          typedRow.recent_food_id,
          new Date(typedRow.last_used),
          typedRow.times_used,
        )
      }
    })

    return recentTemplates
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
