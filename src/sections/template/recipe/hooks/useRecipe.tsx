'use client'

import { Recipe } from '@/legacy/model/recipeModel'
import { useEffect } from 'react'
import { useFetch } from '@/sections/common/hooks/useFetch'
import { searchRecipeById } from '@/legacy/controllers/recipes'

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
