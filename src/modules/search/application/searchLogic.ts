// Unified, testable logic for fetching templates by tab
// All exported functions will have JSDoc

import type { Food } from '~/modules/diet/food/domain/food'
import type { Recipe } from '~/modules/diet/recipe/domain/recipe'
import type { Template } from '~/modules/diet/template/domain/template'
import { availableTabs } from '~/sections/search/components/TemplateSearchTabs'

/**
 * Dependencies for fetchTemplatesByTabLogic
 */
export type FetchTemplatesDeps = {
  fetchUserRecipes: (userId: number) => Promise<readonly Recipe[]>
  fetchUserRecipeByName: (
    userId: number,
    name: string,
  ) => Promise<readonly Recipe[]>
  fetchUserRecentFoods: (
    userId: number,
  ) => Promise<
    { type: 'food' | 'recipe'; reference_id: number; last_used: Date }[]
  >
  fetchFoodById: (id: number) => Promise<Food>
  fetchRecipeById: (id: number) => Promise<Recipe>
  fetchFoods: (opts: {
    limit?: number
    allowedFoods?: number[]
  }) => Promise<readonly Food[]>
  fetchFoodsByName: (
    name: string,
    opts: { limit?: number; allowedFoods?: number[] },
  ) => Promise<readonly Food[]>
  getFavoriteFoods: () => number[]
}

/**
 * Fetches templates (foods/recipes) for a given tab and search string.
 * @param tabId - The tab identifier
 * @param search - The search string
 * @param userId - The user id
 * @param deps - The dependencies for fetching data
 * @returns Array of templates matching the tab and search
 */
export async function fetchTemplatesByTabLogic(
  tabId: string,
  search: string,
  userId: number,
  deps: FetchTemplatesDeps,
): Promise<readonly Template[]> {
  const lowerSearch = search.trim().toLowerCase()
  switch (tabId) {
    case availableTabs.Recentes.id: {
      const recentItems = await deps.fetchUserRecentFoods(userId)
      const foodIds = recentItems
        .filter((r) => r.type === 'food')
        .map((r) => r.reference_id)
      const recipeIds = recentItems
        .filter((r) => r.type === 'recipe')
        .map((r) => r.reference_id)
      const foods =
        foodIds.length > 0
          ? await Promise.all(
              foodIds.map((id) => deps.fetchFoodById(id).catch(() => null)),
            )
          : []
      const recipes =
        recipeIds.length > 0
          ? await Promise.all(
              recipeIds.map((id) => deps.fetchRecipeById(id).catch(() => null)),
            )
          : []
      const validFoods = (foods as (Food | null)[]).filter(
        (f): f is Food => f !== null,
      )
      const validRecipes = (recipes as (Recipe | null)[]).filter(
        (r): r is Recipe => r !== null,
      )
      const filterFn = (item: { name: string; EAN?: string | null }) => {
        if (lowerSearch === '') return true
        if (item.name.toLowerCase().includes(lowerSearch)) return true
        if (
          typeof item.EAN === 'string' &&
          item.EAN &&
          item.EAN.toLowerCase().includes(lowerSearch)
        )
          return true
        return false
      }
      const templates: Template[] = []
      for (const recent of recentItems) {
        if (recent.type === 'food') {
          const food = validFoods.find((f) => f.id === recent.reference_id)
          if (food !== undefined && filterFn(food)) templates.push(food)
        } else {
          const recipe = validRecipes.find((r) => r.id === recent.reference_id)
          if (recipe !== undefined && filterFn(recipe)) templates.push(recipe)
        }
      }
      return templates
    }
    case availableTabs.Receitas.id: {
      if (lowerSearch === '') {
        return deps.fetchUserRecipes(userId)
      } else {
        return deps.fetchUserRecipeByName(userId, search)
      }
    }
    case availableTabs.Favoritos.id: {
      const allowedFoods = deps.getFavoriteFoods()
      const limit = undefined
      if (lowerSearch === '') {
        return deps.fetchFoods({ limit, allowedFoods })
      } else {
        return deps.fetchFoodsByName(search, { limit, allowedFoods })
      }
    }
    case availableTabs.Todos.id:
    default: {
      const limit = 50
      if (lowerSearch === '') {
        return deps.fetchFoods({ limit })
      } else {
        return deps.fetchFoodsByName(search, { limit })
      }
    }
  }
}
