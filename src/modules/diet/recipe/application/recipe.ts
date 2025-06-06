import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { type User } from '~/modules/user/domain/user'
import { type Recipe, type NewRecipe } from '../domain/recipe'
import { showPromise } from '~/modules/toast/application/toastManager'
import { handleApiError } from '~/shared/error/errorHandler'

const recipeRepository = createSupabaseRecipeRepository()

export async function fetchUserRecipes(userId: User['id']) {
  try {
    return await recipeRepository.fetchUserRecipes(userId)
  } catch (error) {
    handleApiError(error, {
      component: 'recipeApplication',
      operation: 'fetchUserRecipes',
      additionalData: { userId },
    })
    throw error
  }
}

export async function fetchUserRecipeByName(userId: User['id'], name: string) {
  try {
    return await recipeRepository.fetchUserRecipeByName(userId, name)
  } catch (error) {
    handleApiError(error, {
      component: 'recipeApplication',
      operation: 'fetchUserRecipeByName',
      additionalData: { userId, name },
    })
    throw error
  }
}

export async function fetchRecipeById(recipeId: Recipe['id']) {
  try {
    return await recipeRepository.fetchRecipeById(recipeId)
  } catch (error) {
    handleApiError(error, {
      component: 'recipeApplication',
      operation: 'fetchRecipeById',
      additionalData: { recipeId },
    })
    throw error
  }
}

export async function insertRecipe(newRecipe: NewRecipe) {
  try {
    const recipe = await showPromise(
      recipeRepository.insertRecipe(newRecipe),
      {
        loading: 'Criando nova receita...',
        success: 'Receita criada com sucesso',
        error: 'Falha ao criar receita',
      },
      { context: 'user-action' },
    )
    return recipe
  } catch (error) {
    handleApiError(error, {
      component: 'recipeApplication',
      operation: 'insertRecipe',
      additionalData: { newRecipe },
    })
    throw error
  }
}

export async function updateRecipe(recipeId: Recipe['id'], newRecipe: Recipe) {
  try {
    const recipe = await showPromise(
      recipeRepository.updateRecipe(recipeId, newRecipe),
      {
        loading: 'Atualizando receita...',
        success: 'Receita atualizada com sucesso',
        error: 'Falha ao atualizar receita',
      },
      { context: 'user-action' },
    )
    return recipe
  } catch (error) {
    handleApiError(error, {
      component: 'recipeApplication',
      operation: 'updateRecipe',
      additionalData: { recipeId, newRecipe },
    })
    throw error
  }
}

export async function deleteRecipe(recipeId: Recipe['id']) {
  try {
    const recipe = await showPromise(
      recipeRepository.deleteRecipe(recipeId),
      {
        loading: 'Deletando receita...',
        success: 'Receita deletada com sucesso',
        error: 'Falha ao deletar receita',
      },
      { context: 'user-action' },
    )
    return recipe
  } catch (error) {
    handleApiError(error, {
      component: 'recipeApplication',
      operation: 'deleteRecipe',
      additionalData: { recipeId },
    })
    throw error
  }
}
