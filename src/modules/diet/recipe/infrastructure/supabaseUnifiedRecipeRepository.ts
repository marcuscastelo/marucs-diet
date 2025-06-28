import {
  type NewUnifiedRecipe,
  type UnifiedRecipe,
} from '~/modules/diet/recipe/domain/recipe'
import {
  convertNewUnifiedRecipeToNewRecipe,
  convertRecipeToUnifiedRecipe,
  convertUnifiedRecipeToRecipe,
} from '~/modules/diet/recipe/domain/recipeConversionUtils'
import { type UnifiedRecipeRepository } from '~/modules/diet/recipe/domain/unifiedRecipeRepository'
import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { type User } from '~/modules/user/domain/user'

export function createSupabaseUnifiedRecipeRepository(): UnifiedRecipeRepository {
  const legacyRepository = createSupabaseRecipeRepository()

  return {
    fetchUserRecipes,
    fetchRecipeById,
    fetchUserRecipeByName,
    insertRecipe,
    updateRecipe,
    deleteRecipe,
  }

  /**
   * Fetches all recipes for a user, converts to UnifiedRecipe.
   * Throws on error.
   * @param userId - The user ID
   * @returns Array of UnifiedRecipes
   * @throws Error on API/validation error
   */
  async function fetchUserRecipes(
    userId: User['id'],
  ): Promise<readonly UnifiedRecipe[]> {
    const legacyRecipes = await legacyRepository.fetchUserRecipes(userId)
    return legacyRecipes.map(convertRecipeToUnifiedRecipe)
  }

  /**
   * Fetches a recipe by its ID, converts to UnifiedRecipe.
   * Throws on error or if not found.
   * @param id - The recipe ID
   * @returns The UnifiedRecipe
   * @throws Error if not found or on API/validation error
   */
  async function fetchRecipeById(
    id: UnifiedRecipe['id'],
  ): Promise<UnifiedRecipe> {
    const legacyRecipe = await legacyRepository.fetchRecipeById(id)
    return convertRecipeToUnifiedRecipe(legacyRecipe)
  }

  /**
   * Fetches a user's recipe by name (partial, case-insensitive, diacritic-insensitive), converts to UnifiedRecipe.
   * Throws on error.
   * @param userId - The user ID
   * @param name - The recipe name (partial or full)
   * @returns Array of UnifiedRecipes
   * @throws Error on API/validation error
   */
  async function fetchUserRecipeByName(
    userId: User['id'],
    name: UnifiedRecipe['name'],
  ): Promise<readonly UnifiedRecipe[]> {
    const legacyRecipes = await legacyRepository.fetchUserRecipeByName(
      userId,
      name,
    )
    return legacyRecipes.map(convertRecipeToUnifiedRecipe)
  }

  /**
   * Inserts a new recipe, converts from UnifiedRecipe to Recipe for database storage.
   * Throws on error or if not created.
   * @param newRecipe - The new UnifiedRecipe
   * @returns The created UnifiedRecipe
   * @throws Error if not created or on API/validation error
   */
  async function insertRecipe(
    newRecipe: NewUnifiedRecipe,
  ): Promise<UnifiedRecipe> {
    const legacyNewRecipe = convertNewUnifiedRecipeToNewRecipe(newRecipe)
    const legacyRecipe = await legacyRepository.insertRecipe(legacyNewRecipe)
    return convertRecipeToUnifiedRecipe(legacyRecipe)
  }

  /**
   * Updates a recipe, converts from UnifiedRecipe to Recipe for database storage.
   * Throws on error or if not found after update.
   * @param recipeId - The recipe ID
   * @param newRecipe - The new UnifiedRecipe data
   * @returns The updated UnifiedRecipe
   * @throws Error if not found or on API/validation error
   */
  async function updateRecipe(
    recipeId: UnifiedRecipe['id'],
    newRecipe: UnifiedRecipe,
  ): Promise<UnifiedRecipe> {
    const legacyRecipe = convertUnifiedRecipeToRecipe(newRecipe)
    const updatedLegacyRecipe = await legacyRepository.updateRecipe(
      recipeId,
      legacyRecipe,
    )
    return convertRecipeToUnifiedRecipe(updatedLegacyRecipe)
  }

  /**
   * Deletes a recipe by ID.
   * Throws on error.
   * @param id - The recipe ID
   * @throws Error on API error
   */
  async function deleteRecipe(id: UnifiedRecipe['id']): Promise<void> {
    await legacyRepository.deleteRecipe(id)
  }
}
