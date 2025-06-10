import supabase from '~/legacy/utils/supabase'
import {
  type NewRecipe,
  type Recipe,
} from '~/modules/diet/recipe/domain/recipe'
import { type RecipeRepository } from '~/modules/diet/recipe/domain/recipeRepository'
import {
  createInsertRecipeDAOFromNewRecipe,
  createRecipeFromDAO,
  createUpdateRecipeDAOFromRecipe,
  recipeDAOSchema,
} from '~/modules/diet/recipe/infrastructure/recipeDAO'
import { type User } from '~/modules/user/domain/user'
import { handleApiError, wrapErrorWithStack } from '~/shared/error/errorHandler'
import { parseWithStack } from '~/shared/utils/parseWithStack'

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

// TODO: handle errors (also in the rest of the controllers)
const fetchUserRecipes = async (userId: User['id']): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .eq('owner', userId)

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseRecipeRepository',
      operation: 'fetchUserRecipes',
      additionalData: { userId },
    })
    throw wrapErrorWithStack(error)
  }

  const recipeDAOs = parseWithStack(recipeDAOSchema.array(), data)
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  return recipes
}

const fetchRecipeById = async (id: Recipe['id']): Promise<Recipe> => {
  const { data, error } = await supabase.from(TABLE).select().eq('id', id)

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseRecipeRepository',
      operation: 'fetchRecipeById',
      additionalData: { id },
    })
    throw wrapErrorWithStack(error)
  }

  const recipeDAOs = parseWithStack(recipeDAOSchema.array(), data)
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  if (!recipes[0]) {
    throw new Error(`Recipe with id ${id} not found`)
  }
  return recipes[0]
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
      additionalData: { userId, name },
    })
    throw wrapErrorWithStack(error)
  }

  const recipeDAOs = parseWithStack(recipeDAOSchema.array(), data)
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  return recipes
}

const insertRecipe = async (newRecipe: NewRecipe): Promise<Recipe> => {
  const createDAO = createInsertRecipeDAOFromNewRecipe(newRecipe)

  const { data, error } = await supabase.from(TABLE).insert(createDAO).select()

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseRecipeRepository',
      operation: 'insertRecipe',
      additionalData: { recipe: newRecipe },
    })
    throw wrapErrorWithStack(error)
  }

  const recipeDAOs = parseWithStack(recipeDAOSchema.array(), data)
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  if (!recipes[0]) {
    throw new Error('Recipe not created')
  }
  return recipes[0]
}

const updateRecipe = async (
  recipeId: Recipe['id'],
  newRecipe: Recipe,
): Promise<Recipe> => {
  console.debug(
    `[RecipeController] Updating recipe ${recipeId} with`,
    newRecipe,
  )

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
      additionalData: { id: recipeId, recipe: newRecipe },
    })
    throw wrapErrorWithStack(error)
  }

  const recipeDAOs = parseWithStack(recipeDAOSchema.array(), data)
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  if (recipes[0] === undefined) {
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
      additionalData: { id },
    })
    throw wrapErrorWithStack(error)
  }

  const recipeDAOs = parseWithStack(recipeDAOSchema.array(), data)
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  if (!recipes[0]) {
    throw new Error('Recipe not found after delete')
  }
  return recipes[0]
}
