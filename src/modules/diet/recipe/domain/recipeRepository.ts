import { type User } from '@/modules/user/domain/user'
import { type DbReady } from '@/legacy/utils/newDbRecord'
import { type Recipe } from '@/modules/diet/recipe/domain/recipe'

export type RecipeRepository = {
  fetchUserRecipes: (userId: User['id']) => Promise<readonly Recipe[]>
  fetchRecipeById: (id: Recipe['id']) => Promise<Recipe | null>
  fetchUserRecipeByName: (
    userId: User['id'],
    name: Recipe['name'],
  ) => Promise<readonly Recipe[]>
  insertRecipe: (newRecipe: DbReady<Recipe>) => Promise<Recipe | null>
  updateRecipe: (
    recipeId: Recipe['id'],
    newRecipe: DbReady<Recipe>,
  ) => Promise<Recipe>
  deleteRecipe: (id: Recipe['id']) => Promise<Recipe>
}
