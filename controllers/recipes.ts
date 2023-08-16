import { Recipe, recipeSchema } from '@/model/recipeModel'
import { User } from '@/model/userModel'
import { New } from '@/utils/newDbRecord'
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
    console.error(error)
    throw error
  }
  return recipeSchema.parse(recipes?.[0] ?? null)
}

export const updateRecipe = async (
  id: Recipe['id'],
  recipe: New<Recipe>,
): Promise<Recipe> => {
  // TODO: Remove '' and id fields on every update (how to do it in a cleaner way?)
  delete (recipe as Partial<Recipe>)['']
  delete (recipe as Partial<Recipe>).id
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
