import { Recipe, recipeSchema } from '@/model/recipeModel'
import { User } from '@/model/userModel'
import { New } from '@/utils/newDbRecord'
import supabase from '@/utils/supabase'

const TABLE = 'recipes'

// TODO: retriggered: tratar erros (também no resto dos controllers)
export const listRecipes = async (userId: User['id']): Promise<Recipe[]> =>
  ((await supabase.from(TABLE).select()).data ?? [])
    .map((recipe) => recipeSchema.parse(recipe))
    .filter((recipe) => recipe.owner === userId)

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
    throw error
  }

  return recipeSchema.parse(recipe ?? null)
}

export const upsertRecipe = async (
  recipe: Partial<New<Recipe>>,
): Promise<Recipe | null> => {
  if ('id' in recipe) {
    console.error('Recipe should not have an id') // TODO: better error handling
    delete recipe.id
  }
  const { data: recipes, error } = await supabase
    .from(TABLE)
    .upsert(recipe)
    .select()
  if (error) {
    throw error
  }
  return recipeSchema.parse(recipes?.[0] ?? null)
}

export const updateDay = async (
  id: Recipe['id'],
  recipe: New<Recipe>,
): Promise<Recipe> => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(recipe)
    .eq('id', id)
    .select()

  if (error) {
    throw error
  }

  return recipeSchema.parse(data?.[0] ?? null)
}

// TODO: retriggered: add boolean to check on usages of this function
export const deleteDay = async (id: Recipe['id']): Promise<void> => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id).select()

  if (error) {
    throw error
  }
}