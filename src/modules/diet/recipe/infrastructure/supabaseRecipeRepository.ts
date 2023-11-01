import { type Recipe } from '@/modules/diet/recipe/domain/recipe'
import { type User } from '@/modules/user/domain/user'
import { type DbReady, enforceDbReady } from '@/legacy/utils/newDbRecord'
import supabase from '@/legacy/utils/supabase'
import { type Mutable } from '@/legacy/utils/typeUtils'
import { type RecipeRepository } from '@/modules/diet/recipe/domain/recipeRepository'
import {
  createRecipeFromDAO,
  recipeDAOSchema
} from '@/modules/diet/recipe/infrastructure/recipeDAO'

const TABLE = 'recipes'

export function createSupabaseRecipeRepository (): RecipeRepository {
  return {
    fetchUserRecipes,
    fetchRecipeById,
    fetchRecipeByName,
    insertRecipe: upsertRecipe,
    updateRecipe,
    deleteRecipe
  }
}

// TODO: retriggered: tratar erros (também no resto dos controllers)
const fetchUserRecipes = async (userId: User['id']): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .eq('owner', userId)

  if (error !== null) {
    console.error(error)
    throw error
  }

  const recipeDAOs = recipeDAOSchema.array().parse(data ?? [])
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  return recipes
}

const fetchRecipeById = async (id: Recipe['id']): Promise<Recipe | null> => {
  const { data, error } = await supabase.from(TABLE).select().eq('id', id)

  if (error !== null) {
    console.error(error)
    throw error
  }

  const recipeDAOs = recipeDAOSchema.array().parse(data ?? [])
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  return recipes[0] ?? null
}

const fetchRecipeByName = async (
  userId: User['id'],
  name: Recipe['name']
): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select()
    .eq('owner', userId)
    .eq('name', name)

  if (error !== null) {
    console.error(error)
    throw error
  }

  const recipeDAOs = recipeDAOSchema.array().parse(data ?? [])
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  return recipes
}

const upsertRecipe = async (
  newRecipe: DbReady<Recipe>
): Promise<Recipe | null> => {
  // TODO: Remove macros field from recipe type, it should be calculated from items only locally
  delete (newRecipe as Partial<Mutable<Recipe>>).macros

  const recipe = enforceDbReady(newRecipe)

  const { data, error } = await supabase.from(TABLE).upsert(recipe).select()

  if (error !== null) {
    console.error(error)
    throw error
  }

  const recipeDAOs = recipeDAOSchema.array().parse(data ?? [])
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  return recipes[0] ?? null
}

const updateRecipe = async (
  id: Recipe['id'],
  newRecipe: DbReady<Recipe>
): Promise<Recipe> => {
  const recipe = enforceDbReady(newRecipe)

  // TODO: Remove macros field from recipe type, it should be calculated from items only locally
  delete (recipe as Partial<Mutable<Recipe>>).macros

  console.debug(`[RecipeController] Updating recipe ${id} with`, recipe)

  const { data, error } = await supabase
    .from(TABLE)
    .update(recipe)
    .eq('id', id)
    .select()

  if (error !== null) {
    console.error(error)
    throw error
  }

  const recipeDAOs = recipeDAOSchema.array().parse(data ?? [])
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  return recipes[0] ?? null
}

const deleteRecipe = async (id: Recipe['id']): Promise<Recipe> => {
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .select()

  if (error !== null) {
    console.error(error)
    throw error
  }

  const recipeDAOs = recipeDAOSchema.array().parse(data ?? [])
  const recipes = recipeDAOs.map(createRecipeFromDAO)

  return recipes[0] ?? null
}
