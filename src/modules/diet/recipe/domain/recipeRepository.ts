import { User } from '@/modules/user/domain/user'
import { DbReady } from '@/legacy/utils/newDbRecord'
import { Recipe } from '@/modules/diet/recipe/domain/recipe'

export interface RecipeRepository {
  fetchUserRecipes(userId: User['id']): Promise<readonly Recipe[]>
  fetchRecipeById(id: Recipe['id']): Promise<Recipe | null>
  fetchRecipeByName(
    userId: User['id'],
    name: Recipe['name'],
  ): Promise<readonly Recipe[]>
  insertRecipe(newRecipe: DbReady<Recipe>): Promise<Recipe | null>
  updateRecipe(
    recipeId: Recipe['id'],
    newRecipe: DbReady<Recipe>,
  ): Promise<Recipe>
  deleteRecipe(id: Recipe['id']): Promise<Recipe>
}
