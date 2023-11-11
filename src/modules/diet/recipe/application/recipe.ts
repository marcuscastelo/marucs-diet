import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { type User } from '~/modules/user/domain/user'

const recipeRepository = createSupabaseRecipeRepository()

export async function fetchUserRecipes(userId: User['id']) {
  return await recipeRepository.fetchUserRecipes(userId)
}

export async function fetchUserRecipeByName(userId: User['id'], name: string) {
  return await recipeRepository.fetchUserRecipeByName(userId, name)
}
