import {
  type NewUnifiedRecipe,
  type UnifiedRecipe,
} from '~/modules/diet/recipe/domain/recipe'
import { createSupabaseUnifiedRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseUnifiedRecipeRepository'
import { showPromise } from '~/modules/toast/application/toastManager'
import { type User } from '~/modules/user/domain/user'
import { handleApiError } from '~/shared/error/errorHandler'

const unifiedRecipeRepository = createSupabaseUnifiedRecipeRepository()

export async function fetchUserUnifiedRecipes(userId: User['id']) {
  try {
    return await showPromise(
      unifiedRecipeRepository.fetchUserRecipes(userId),
      {
        loading: 'Carregando receitas...',
        success: 'Receitas carregadas com sucesso',
        error: 'Falha ao carregar receitas',
      },
      { context: 'background', audience: 'user' },
    )
  } catch (error) {
    handleApiError(error)
    return []
  }
}

export async function fetchUserUnifiedRecipeByName(
  userId: User['id'],
  name: string,
) {
  try {
    return await showPromise(
      unifiedRecipeRepository.fetchUserRecipeByName(userId, name),
      {
        loading: 'Carregando receitas...',
        success: 'Receitas carregadas com sucesso',
        error: 'Falha ao carregar receitas',
      },
      { context: 'background', audience: 'user' },
    )
  } catch (error) {
    handleApiError(error)
    return []
  }
}

export async function fetchUnifiedRecipeById(recipeId: UnifiedRecipe['id']) {
  try {
    return await showPromise(
      unifiedRecipeRepository.fetchRecipeById(recipeId),
      {
        loading: 'Carregando receita...',
        success: 'Receita carregada com sucesso',
        error: 'Falha ao carregar receita',
      },
      { context: 'background', audience: 'user' },
    )
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function saveUnifiedRecipe(
  newRecipe: NewUnifiedRecipe,
): Promise<UnifiedRecipe | null> {
  try {
    return await showPromise(
      unifiedRecipeRepository.insertRecipe(newRecipe),
      {
        loading: 'Salvando receita...',
        success: 'Receita salva com sucesso',
        error: 'Falha ao salvar receita',
      },
      { context: 'background', audience: 'user' },
    )
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function updateUnifiedRecipe(
  recipeId: UnifiedRecipe['id'],
  recipe: UnifiedRecipe,
): Promise<UnifiedRecipe | null> {
  try {
    return await showPromise(
      unifiedRecipeRepository.updateRecipe(recipeId, recipe),
      {
        loading: 'Atualizando receita...',
        success: 'Receita atualizada com sucesso',
        error: 'Falha ao atualizar receita',
      },
      { context: 'background', audience: 'user' },
    )
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function deleteUnifiedRecipe(recipeId: UnifiedRecipe['id']) {
  try {
    await showPromise(
      unifiedRecipeRepository.deleteRecipe(recipeId),
      {
        loading: 'Excluindo receita...',
        success: 'Receita excluída com sucesso',
        error: 'Falha ao excluir receita',
      },
      { context: 'background', audience: 'user' },
    )
    return true
  } catch (error) {
    handleApiError(error)
    return false
  }
}
