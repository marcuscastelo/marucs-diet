import { Recipe, recipeSchema } from '@/modules/recipe/domain/recipe'
import { User } from '@/modules/user/domain/user'
import { DbReady, enforceDbReady } from '@/legacy/utils/newDbRecord'
import supabase from '@/legacy/utils/supabase'
import { Mutable } from '@/legacy/utils/typeUtils'

const TABLE = 'recipes'

// TODO: retriggered: tratar erros (também no resto dos controllers)
export const listRecipes = async (userId: User['id']): Promise<Recipe[]> => {
  const { data: recipes, error } = await supabase
    .from(TABLE)
    .select()
    .eq('owner', userId)

  if (error) {
    console.error(error)
    throw error
  }

  return recipes.map((recipe) => recipeSchema.parse(recipe))
}

export const searchRecipeById = async (
  id: Recipe['id'],
): Promise<Recipe | null> => {
  const { data: recipe, error } = await supabase
    .from(TABLE)
    .select()
    .eq('id', id)
    .limit(1) // TODO: Cause warning when more than one recipe is found for the same id
    .single()

  if (error) {
    console.error(error)
    throw error
  }

  return recipeSchema.parse(recipe ?? null)
}

export const searchRecipeByName = async (
  userId: User['id'],
  name: Recipe['name'],
): Promise<Recipe[]> => {
  const { data: recipes, error } = await supabase
    .from(TABLE)
    .select()
    .eq('owner', userId)
    .eq('name', name)

  if (error) {
    console.error(error)
    throw error
  }

  return recipes.map((recipe) => recipeSchema.parse(recipe))
}

export const upsertRecipe = async (
  newRecipe: Partial<DbReady<Recipe>>,
): Promise<Recipe | null> => {
  // TODO: Remove macros field from recipe type, it should be calculated from items only locally
  delete (newRecipe as Partial<Mutable<Recipe>>).macros

  const recipe = enforceDbReady(newRecipe)

  const { data: recipes, error } = await supabase
    .from(TABLE)
    .upsert(recipe)
    .select()

  if (error) {
    console.error(error)
    throw error
  }

  return recipeSchema.parse(recipes?.[0] ?? null)
}

export const updateRecipe = async (
  id: Recipe['id'],
  newRecipe: DbReady<Recipe>,
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

  if (error) {
    console.error(error)
    throw error
  }

  return recipeSchema.parse(data?.[0] ?? null)
}
