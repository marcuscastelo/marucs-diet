// Application layer for recent food operations, migrated from legacy controller
// All error handling is done here, domain remains pure
import { z } from 'zod'

import { foodSchema } from '~/modules/diet/food/domain/food'
import { recipeSchema } from '~/modules/diet/recipe/domain/recipe'
import type { Template } from '~/modules/diet/template/domain/template'
import { showPromise } from '~/modules/toast/application/toastManager'
import env from '~/shared/config/env'
import { handleApiError } from '~/shared/error/errorHandler'
import { parseWithStack } from '~/shared/utils/parseWithStack'
import { removeDiacritics } from '~/shared/utils/removeDiacritics'
import supabase from '~/shared/utils/supabase'

const TABLE = 'recent_foods'

// Database record type (replaces RecentFood domain entity)
type RecentFoodRecord = {
  id: number
  user_id: number
  type: 'food' | 'recipe'
  reference_id: number
  last_used: Date
  times_used: number
}

// Input type for creating/updating recent foods
type RecentFoodInput = {
  user_id: number
  type: 'food' | 'recipe'
  reference_id: number
  last_used?: Date
  times_used?: number
}

// Creation params type (for backward compatibility)
type RecentFoodCreationParams = Partial<RecentFoodRecord> &
  Pick<RecentFoodRecord, 'user_id' | 'type' | 'reference_id'>

// Database record schema for validation
const recentFoodRecordSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  type: z.enum(['food', 'recipe']),
  reference_id: z.number(),
  last_used: z.coerce.date(),
  times_used: z.number(),
})

/**
 * Creates a recent food input object (replaces createNewRecentFood)
 */
export function createRecentFoodInput(
  params: RecentFoodCreationParams,
): RecentFoodInput {
  return {
    user_id: params.user_id,
    type: params.type,
    reference_id: params.reference_id,
    last_used: new Date(),
    times_used: (params.times_used ?? 0) + 1,
  }
}

// Schema for the enhanced database function response
const enhancedRecentFoodRowSchema = z
  .object({
    recent_food_id: z.number(),
    user_id: z.number(),
    type: z.enum(['food', 'recipe']),
    reference_id: z.number(),
    last_used: z.coerce.date(),
    times_used: z.number(),
    template_id: z.number(),
    template_name: z.string(),
    template_ean: z.string().nullable(),
    template_source: z.unknown(),
    template_macros: z.unknown(),
    template_owner: z.number().nullable(),
    template_items: z.unknown(),
    template_prepared_multiplier: z.number().nullable(),
  })
  .strip()

// Helper function to safely get recipe fields
function getRecipeFields(row: z.infer<typeof enhancedRecentFoodRowSchema>) {
  if (row.type !== 'recipe') {
    throw new Error('Expected recipe type but got food')
  }

  const owner = row.template_owner
  const preparedMultiplier = row.template_prepared_multiplier

  if (owner === null || preparedMultiplier === null) {
    throw new Error('Recipe fields cannot be null')
  }

  return { owner, preparedMultiplier }
}

/**
 * Fetches a recent food by user, type and reference ID.
 * @param userId - The user ID.
 * @param type - The type ('food' | 'recipe').
 * @param referenceId - The reference ID (foods.id ou recipes.id).
 * @returns The recent food record or null if not found or on error.
 */
export async function fetchRecentFoodByUserTypeAndReferenceId(
  userId: number,
  type: 'food' | 'recipe',
  referenceId: number,
): Promise<RecentFoodRecord | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('reference_id', referenceId)
    if (error !== null) throw error

    const records = parseWithStack(recentFoodRecordSchema.array(), data)
    return records.at(0) ?? null
  } catch (error) {
    handleApiError(error)
    return null
  }
}

/**
 * Fetches recent foods as Templates for a user with optional limit and search filtering.
 * Uses the enhanced database function to return complete Template objects directly.
 * @param userId - The user ID.
 * @param limit - Maximum number of recent foods to fetch (defaults to environment configuration).
 * @param search - Optional search term to filter by food/recipe names (case and diacritic insensitive).
 * @returns Array of Template objects or empty array on error.
 */
export async function fetchUserRecentFoods(
  userId: number,
  limit: number = env.VITE_RECENT_FOODS_DEFAULT_LIMIT,
  search?: string,
): Promise<readonly Template[]> {
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

    // Transform the enhanced result to Template objects
    const validatedRows = parseWithStack(
      enhancedRecentFoodRowSchema.array(),
      response.data,
    )
    const templates = validatedRows.map((row) => {
      // Create the appropriate Template object based on type
      if (row.type === 'food') {
        return parseWithStack(foodSchema, {
          id: row.template_id,
          name: row.template_name,
          ean: row.template_ean,
          source: row.template_source,
          macros: row.template_macros,
          __type: 'Food',
        })
      } else {
        const { owner, preparedMultiplier } = getRecipeFields(row)
        return parseWithStack(recipeSchema, {
          id: row.template_id,
          name: row.template_name,
          owner,
          items: row.template_items,
          prepared_multiplier: preparedMultiplier,
          __type: 'Recipe',
        })
      }
    })

    return templates
  } catch (error) {
    handleApiError(error)
    return []
  }
}

/**
 * Inserts a new recent food.
 * @param recentFoodInput - The new recent food data.
 * @returns The inserted recent food record or null on error.
 */
export async function insertRecentFood(
  recentFoodInput: RecentFoodInput,
): Promise<RecentFoodRecord | null> {
  try {
    return await showPromise(
      (async () => {
        const insertData = {
          user_id: recentFoodInput.user_id,
          type: recentFoodInput.type,
          reference_id: recentFoodInput.reference_id,
          last_used: recentFoodInput.last_used ?? new Date(),
          times_used: recentFoodInput.times_used ?? 1,
        }
        const { data, error } = await supabase
          .from(TABLE)
          .insert(insertData)
          .select()
        if (error !== null) throw error
        return parseWithStack(recentFoodRecordSchema, data[0])
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
 * @param recentFoodInput - The new recent food data.
 * @returns The updated recent food record or null on error.
 */
export async function updateRecentFood(
  recentFoodId: number,
  recentFoodInput: RecentFoodInput,
): Promise<RecentFoodRecord | null> {
  try {
    return await showPromise(
      (async () => {
        const updateData = {
          user_id: recentFoodInput.user_id,
          type: recentFoodInput.type,
          reference_id: recentFoodInput.reference_id,
          last_used: recentFoodInput.last_used ?? new Date(),
          times_used: recentFoodInput.times_used ?? 1,
        }
        const { data, error } = await supabase
          .from(TABLE)
          .update(updateData)
          .eq('id', recentFoodId)
          .select()
        if (error !== null) throw error
        return parseWithStack(recentFoodRecordSchema, data[0])
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
  userId: number,
  type: 'food' | 'recipe',
  referenceId: number,
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
