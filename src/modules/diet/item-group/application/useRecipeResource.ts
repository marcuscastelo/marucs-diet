import { createResource } from 'solid-js'

import {
  isRecipedItemGroup,
  type ItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { fetchRecipeById } from '~/modules/diet/recipe/application/recipe'

/**
 * Provides a SolidJS resource for fetching a recipe by group if it is a recipe group.
 * @param group - Accessor for the current ItemGroup
 * @returns SolidJS resource tuple for the recipe
 */
export function useRecipeResource(group: () => ItemGroup) {
  return createResource(async () => {
    const group_ = group()
    if (!isRecipedItemGroup(group_)) return null
    return await fetchRecipeById(group_.recipe)
  })
}
