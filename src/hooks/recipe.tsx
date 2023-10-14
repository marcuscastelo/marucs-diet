'use client'

import { Recipe } from '@/model/recipeModel'
import { useEffect } from 'react'
import { useFetch } from '@/hooks/fetch'
import { searchRecipeById } from '@/controllers/recipes'

export function useRecipe(recipeId: Recipe['id']) {
  const { data, fetch } = useFetch(searchRecipeById)

  useEffect(() => {
    fetch(recipeId)
  }, [fetch, recipeId])

  return {
    recipe: data,
    refetch: fetch,
  }
}
