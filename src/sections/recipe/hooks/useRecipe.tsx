import { createSignal, type Accessor, createEffect } from 'solid-js'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { createSupabaseRecipeRepository } from '~/modules/diet/recipe/infrastructure/supabaseRecipeRepository'

// TODO:   Use repository pattern through use cases instead of directly using repositories
const recipeRepository = createSupabaseRecipeRepository()

/**
 * Fetches a recipe by ID and exposes its loadable state and a refetch function.
 *
 * @deprecated Should be replaced by use cases
 * @param recipeId - Accessor for the recipe ID
 * @returns An object with the recipe loadable signal and a refetch function
 */
export function useRecipe(recipeId: Accessor<Recipe['id']>) {
  const [recipe, setRecipe] = createSignal<{
    loading: boolean
    errored?: boolean
    error?: unknown
    data?: Recipe | null
  }>({ loading: true })

  const fetchRecipe = (id: Recipe['id']) => {
    recipeRepository
      .fetchRecipeById(id)
      .then((data) => {
        setRecipe({ loading: false, errored: false, data })
      })
      .catch((error: unknown) => {
        setRecipe({ loading: false, errored: true, error })
      })
  }

  createEffect(() => {
    fetchRecipe(recipeId())
  })

  return {
    recipe,
    refetch: fetchRecipe,
  }
}
