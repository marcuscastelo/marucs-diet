import { createResource, createSignal, untrack } from 'solid-js'

import {
  fetchFoodById,
  fetchFoods,
  fetchFoodsByIds,
  fetchFoodsByName,
} from '~/modules/diet/food/application/food'
import { Food } from '~/modules/diet/food/domain/food'
import {
  fetchRecipeById,
  fetchUserRecipeByName,
  fetchUserRecipes,
} from '~/modules/diet/recipe/application/recipe'
import { Recipe } from '~/modules/diet/recipe/domain/recipe'
import { Template } from '~/modules/diet/template/domain/template'
import { fetchUserRecentFoods } from '~/modules/recent-food/application/recentFood'
import { currentUser, currentUserId } from '~/modules/user/application/user'
import {
  type AvailableTab,
  availableTabs,
} from '~/sections/search/components/TemplateSearchTabs'

const fetchRecentsForModal = async (
  search: string = '',
): Promise<readonly Template[]> => {
  const recentItems = await fetchUserRecentFoods(currentUserId())
  const foodIds = recentItems
    .filter((r) => r.type === 'food')
    .map((r) => r.reference_id)
  const recipeIds = recentItems
    .filter((r) => r.type === 'recipe')
    .map((r) => r.reference_id)

  // Fetch foods and recipes in parallel
  const foods =
    foodIds.length > 0
      ? await Promise.all(
          foodIds.map((id) => fetchFoodById(id).catch(() => null)),
        )
      : []
  const recipes =
    recipeIds.length > 0
      ? await Promise.all(
          recipeIds.map((id) => fetchRecipeById(id).catch(() => null)),
        )
      : []

  // Filter out nulls (not found)
  const validFoods = (foods as (Food | null)[]).filter(
    (f): f is Food => f !== null,
  )
  const validRecipes = (recipes as (Recipe | null)[]).filter(
    (r): r is Recipe => r !== null,
  )

  // Filter by search string (case-insensitive, name or EAN)
  const lowerSearch = search.trim().toLowerCase()
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

  // Sort by recency (last_used)
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

const fetchFoodsForModal = async (): Promise<readonly Food[]> => {
  const getAllowedFoods = async () => {
    switch (templateSearchTab()) {
      case 'favorites':
        return currentUser()?.favorite_foods ?? []
      case 'recent':
        return (await fetchUserRecentFoods(currentUserId())).map(
          (food) => food.reference_id,
        )
      default:
        return undefined // Allow any food
    }
  }

  const limit =
    templateSearchTab() === 'favorites'
      ? undefined // Show all favorites
      : 50 // Show 50 results

  const allowedFoods = await getAllowedFoods()
  console.debug('[TemplateSearchModal] fetchFunc', {
    tab: templateSearchTab(),
    search: templateSearch(),
    limit,
    allowedFoods,
  })

  let foods: readonly Food[]
  if (templateSearch() === '') {
    foods = await fetchFoods({ limit, allowedFoods })
  } else {
    foods = await fetchFoodsByName(templateSearch(), { limit, allowedFoods })
  }

  // Refactored: For 'recent' tab, ensure all required foods are present by batch fetching any missing ones
  if (templateSearchTab() === 'recent' && Array.isArray(allowedFoods)) {
    const fetchedIds = new Set(foods.map((food) => food.id))
    const missingIds = allowedFoods.filter((id) => !fetchedIds.has(id))
    if (missingIds.length > 0) {
      const batchFoods = await fetchFoodsByIds(missingIds)
      foods = [...foods, ...batchFoods]
    }
    // Ensure order matches allowedFoods
    foods = allowedFoods
      .map((id) => foods.find((food) => food.id === id))
      .filter((food): food is Food => food !== undefined)
  }
  return foods
}

const fetchRecipes = async (): Promise<readonly Recipe[]> => {
  if (templateSearch() === '') {
    return await fetchUserRecipes(currentUserId())
  } else {
    return await fetchUserRecipeByName(currentUserId(), templateSearch())
  }
}

const fetchFunc = async () => {
  const tab_ = templateSearchTab()
  switch (tab_) {
    case 'recent':
      return fetchRecentsForModal(templateSearch())
    case 'recipes':
      return fetchRecipes()
    default:
      return fetchFoodsForModal()
  }
}
export const [templateSearch, setTemplateSearch] = createSignal<string>('')
export const [debouncedSearch, setDebouncedSearch] = createSignal(
  untrack(templateSearch),
)

export const [templateSearchTab, setTemplateSearchTab] =
  createSignal<AvailableTab>(availableTabs.Todos.id)

export const [
  templates,
  { refetch: refetchTemplates, mutate: mutateTemplates },
] = createResource(
  () => ({
    search: debouncedSearch(),
    tab: templateSearchTab(),
    userId: currentUserId(),
  }),
  fetchFunc,
)
