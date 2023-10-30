'use client'

import { Recipe } from '@/modules/diet/recipe/domain/recipe'
import { useEffect } from 'react'
import { useFetch } from '@/sections/common/hooks/useFetch'
import { createSupabaseRecipeRepository } from '@/modules/diet/recipe/infrastructure/supabaseRecipeRepository'

// TODO: Use repository pattern through use cases instead of directly using repositories
const recipeRepository = createSupabaseRecipeRepository()

/**
 * @deprecated Should be replaced by use cases
 */
export function useRecipe(recipeId: Recipe['id']) {
  const { data, fetch } = useFetch(recipeRepository.fetchRecipeById)

  useEffect(() => {
    fetch(recipeId)
  }, [fetch, recipeId])

  return {
    recipe: data,
    refetch: fetch,
  }
}
