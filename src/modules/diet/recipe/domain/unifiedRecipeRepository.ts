import {
  type NewUnifiedRecipe,
  type UnifiedRecipe,
} from '~/modules/diet/recipe/domain/recipe'
import { type User } from '~/modules/user/domain/user'

export type UnifiedRecipeRepository = {
  fetchUserRecipes: (userId: User['id']) => Promise<readonly UnifiedRecipe[]>
  fetchRecipeById: (id: UnifiedRecipe['id']) => Promise<UnifiedRecipe>
  fetchUserRecipeByName: (
    userId: User['id'],
    name: UnifiedRecipe['name'],
  ) => Promise<readonly UnifiedRecipe[]>
  insertRecipe: (newRecipe: NewUnifiedRecipe) => Promise<UnifiedRecipe>
  updateRecipe: (
    recipeId: UnifiedRecipe['id'],
    newRecipe: UnifiedRecipe,
  ) => Promise<UnifiedRecipe>
  deleteRecipe: (id: UnifiedRecipe['id']) => Promise<void>
}
