import { Recipe, recipeSchema } from '@/model/recipeModel'
import { User } from '@/model/userModel'
import { New, enforceNew } from '@/utils/newDbRecord'
import supabase from '@/utils/supabase'

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
  recipe: Partial<New<Recipe>>,
): Promise<Recipe | null> => {
  // TODO: Remove delete from controller code (maybe 2 types for Recipe, raw and calculated)
  delete (recipe as Partial<Recipe>).macros

  if ('id' in recipe) {
    console.error('Recipe should not have an id') // TODO: better error handling
    delete recipe.id
  }

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
  newRecipe: New<Recipe>,
): Promise<Recipe> => {
  const recipe = enforceNew(newRecipe)

  // TODO: Remove delete from controller code (maybe 2 types for Recipe)
  delete (recipe as Partial<Recipe>).macros

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
