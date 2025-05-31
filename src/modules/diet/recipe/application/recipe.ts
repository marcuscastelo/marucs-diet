import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { type User } from '~/modules/user/domain/user'
import { type Recipe, type NewRecipe } from '../domain/recipe'
import toast from 'solid-toast'

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
  const recipe = await toast.promise(recipeRepository.insertRecipe(newRecipe), {
    loading: 'Criando nova receita...',
    success: 'Receita criada com sucesso',
    error: 'Falha ao criar receita',
  })
  return recipe
}

export async function updateRecipe(recipeId: Recipe['id'], newRecipe: Recipe) {
  const weight = await toast.promise(
    recipeRepository.updateRecipe(recipeId, newRecipe),
    {
      loading: 'Atualizando receita...',
      success: 'Receita atualizada com sucesso',
      error: 'Falha ao atualizar receita',
    },
  )
  return weight
}

export async function deleteRecipe(recipeId: Recipe['id']) {
  const weight = await toast.promise(recipeRepository.deleteRecipe(recipeId), {
    loading: 'Deletando receita...',
    success: 'Receita deletada com sucesso',
    error: 'Falha ao deletar receita',
  })
  return weight
}
