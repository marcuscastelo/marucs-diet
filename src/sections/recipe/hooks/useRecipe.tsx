import { type Recipe } from '@/modules/diet/recipe/domain/recipe'
import { useFetch } from '@/sections/common/hooks/useFetch'
import { createSupabaseRecipeRepository } from '@/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { type Accessor, createEffect } from 'solid-js'

// TODO: Use repository pattern through use cases instead of directly using repositories
const recipeRepository = createSupabaseRecipeRepository()

/**
 * @deprecated Should be replaced by use cases
 */
export function useRecipe(recipeId: Accessor<Recipe['id']>) {
  const { data, fetch } = useFetch(recipeRepository.fetchRecipeById)

  createEffect(() => {
    fetch(recipeId())
  })

  return {
    recipe: data,
    refetch: fetch,
  }
}
