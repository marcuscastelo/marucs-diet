import { type Recipe, type NewRecipe } from '~/modules/diet/recipe/domain/recipe'
import { type User } from '~/modules/user/domain/user'
import { type DbReady } from '~/legacy/utils/newDbRecord'
import supabase from '~/legacy/utils/supabase'
import { type RecipeRepository } from '~/modules/diet/recipe/domain/recipeRepository'
import {
  CreateRecipeDAO,
  createRecipeFromDAO,
  RecipeDAO,
  recipeDAOSchema,
  UpdateRecipeDAO,
  createInsertRecipeDAOFromNewRecipe,
  createUpdateRecipeDAOFromRecipe,
} from '~/modules/diet/recipe/infrastructure/recipeDAO'
import { handleApiError } from '~/shared/error/errorHandler'

const TABLE = 'recipes'

export function createSupabaseRecipeRepository(): RecipeRepository {
  return {
    fetchUserRecipes,
    fetchRecipeById,
    fetchUserRecipeByName,
    insertRecipe,
    updateRecipe,
    deleteRecipe,
  }
}

// TODO: retriggered: tratar erros (também no resto dos controllers)
const fetchUserRecipes = async (userId: User['id']): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .eq('owner', userId)

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseRecipeRepository',
      operation: 'fetchUserRecipes',
      additionalData: { userId }
    })
    throw error
  }

  const recipeDAOs = recipeDAOSchema.array().parse(data ?? [])
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  return recipes
}

const fetchRecipeById = async (id: Recipe['id']): Promise<Recipe | null> => {
  const { data, error } = await supabase.from(TABLE).select().eq('id', id)

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseRecipeRepository',
      operation: 'fetchRecipeById',
      additionalData: { id }
    })
    throw error
  }

  const recipeDAOs = recipeDAOSchema.array().parse(data ?? [])
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  return recipes[0] ?? null
}

const fetchUserRecipeByName = async (
  userId: User['id'],
  name: Recipe['name'],
): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .eq('owner', userId)
    .eq('name', name)

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseRecipeRepository',
      operation: 'fetchUserRecipeByName',
      additionalData: { userId, name }
    })
    throw error
  }

  const recipeDAOs = recipeDAOSchema.array().parse(data ?? [])
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  return recipes
}

const insertRecipe = async (newRecipe: NewRecipe): Promise<Recipe | null> => {
  const createDAO = createInsertRecipeDAOFromNewRecipe(newRecipe)
  
  const { data, error } = await supabase
    .from(TABLE)
    .insert(createDAO)
    .select()

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseRecipeRepository',
      operation: 'insertRecipe',
      additionalData: { recipe: newRecipe }
    })
    throw error
  }

  const recipeDAOs = recipeDAOSchema.array().parse(data ?? [])
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  return recipes[0] ?? null
}

const updateRecipe = async (
  recipeId: Recipe['id'],
  newRecipe: Recipe,
): Promise<Recipe> => {
  console.debug(`[RecipeController] Updating recipe ${recipeId} with`, newRecipe)

  const updateDAO = createUpdateRecipeDAOFromRecipe(newRecipe)

  const { data, error } = await supabase
    .from(TABLE)
    .update(updateDAO)
    .eq('id', recipeId)
    .select()

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseRecipeRepository',
      operation: 'updateRecipe',
      additionalData: { id: recipeId, recipe: newRecipe }
    })
    throw error
  }

  const recipeDAOs = recipeDAOSchema.array().parse(data ?? [])
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  if (!recipes[0]) {
    throw new Error(`Recipe with id ${recipeId} not found after update`)
  }

  return recipes[0]
}

const deleteRecipe = async (id: Recipe['id']): Promise<Recipe> => {
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .select()

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseRecipeRepository',
      operation: 'deleteRecipe',
      additionalData: { id }
    })
    throw error
  }

  const recipeDAOs = recipeDAOSchema.array().parse(data ?? [])
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  return recipes[0] ?? null
}
