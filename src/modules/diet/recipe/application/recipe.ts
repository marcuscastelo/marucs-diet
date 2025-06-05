import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { type User } from '~/modules/user/domain/user'
import { type Recipe, type NewRecipe } from '../domain/recipe'
import { smartToastPromise } from '~/shared/toast'
import { handleApiError } from '~/shared/error/errorHandler'

const recipeRepository = createSupabaseRecipeRepository()

export async function fetchUserRecipes(userId: User['id']) {
  return await recipeRepository.fetchUserRecipes(userId)
}

export async function fetchUserRecipeByName(userId: User['id'], name: string) {
  return await recipeRepository.fetchUserRecipeByName(userId, name)
}

export async function fetchRecipeById(recipeId: Recipe['id']) {
  return await recipeRepository.fetchRecipeById(recipeId)
}

export async function insertRecipe(newRecipe: NewRecipe) {
  try {
    const recipe = await smartToastPromise(
      recipeRepository.insertRecipe(newRecipe),
      {
        context: 'user-action',
        loading: 'Criando nova receita...',
        success: 'Receita criada com sucesso',
        error: 'Falha ao criar receita',
      },
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
    const weight = await smartToastPromise(
      recipeRepository.updateRecipe(recipeId, newRecipe),
      {
        context: 'user-action',
        loading: 'Atualizando receita...',
        success: 'Receita atualizada com sucesso',
        error: 'Falha ao atualizar receita',
      },
    )
    return weight
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
    const weight = await smartToastPromise(
      recipeRepository.deleteRecipe(recipeId),
      {
        context: 'user-action',
        loading: 'Deletando receita...',
        success: 'Receita deletada com sucesso',
        error: 'Falha ao deletar receita',
      },
    )
    return weight
  } catch (error) {
    handleApiError(error, {
      component: 'recipeApplication',
      operation: 'deleteRecipe',
      additionalData: { recipeId },
    })
    throw error
  }
}
