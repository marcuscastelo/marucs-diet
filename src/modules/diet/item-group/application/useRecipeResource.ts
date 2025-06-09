import { createResource } from 'solid-js'

import { fetchRecipeById } from '~/modules/diet/recipe/application/recipe'

/**
 * Provides a SolidJS resource for fetching a recipe by id.
 * @param recipeId - Accessor for the current recipe id (number or undefined)
 * @returns SolidJS resource tuple for the recipe
 */
export function useRecipeResource(recipeId: () => number | undefined) {
  return createResource(recipeId, async () => {
    const id = recipeId()
    if (typeof id !== 'number') return null
    return await fetchRecipeById(id)
  })
}
