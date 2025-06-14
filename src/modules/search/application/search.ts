import { createResource, createSignal } from 'solid-js'

import {
  fetchFoodById,
  fetchFoods,
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
import { type TemplateSearchTab } from '~/sections/search/components/TemplateSearchTabs'
import { createDebouncedSignal } from '~/shared/utils/createDebouncedSignal'

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
    switch (debouncedTab()) {
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
    debouncedTab() === 'favorites'
      ? undefined // Show all favorites
      : 50 // Show 50 results

  const allowedFoods = await getAllowedFoods()
  console.debug('[TemplateSearchModal] fetchFunc', {
    tab: debouncedTab(),
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

  if (debouncedTab() === 'recent') {
    foods = (
      await Promise.all(
        allowedFoods?.map(async (foodId) => {
          let food: Food | null = null
          const alreadyFechedFood = foods.find((food) => food.id === foodId)
          if (alreadyFechedFood === undefined) {
            console.debug(
              `[TemplateSearchModal] Food is not already fetched: ${foodId}`,
            )
            food = await fetchFoodById(foodId)
          } else {
            console.debug(
              `[TemplateSearchModal] Food is already fetched: ${foodId}`,
            )
            food = alreadyFechedFood
          }
          return food
        }) ?? [],
      )
    ).filter((food): food is Food => food !== null)
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
  const tab_ = debouncedTab()
  switch (tab_) {
    case 'recent':
      return fetchRecentsForModal(templateSearch())
    case 'recipes':
      return fetchRecipes()
    default:
      return fetchFoodsForModal()
  }
}
export const DEFAULT_DEBOUNCE_MS = 500

export const [templateSearch, setTemplateSearch] = createSignal<string>('')
export const [debouncedSearch] = createDebouncedSignal(
  templateSearch,
  DEFAULT_DEBOUNCE_MS,
)

export const [templateSearchTab, setTemplateSearchTab] =
  createSignal<TemplateSearchTab>('hidden')
export const [debouncedTab] = createDebouncedSignal(
  templateSearchTab,
  DEFAULT_DEBOUNCE_MS,
)

export const [
  templates,
  { refetch: refetchTemplates, mutate: mutateTemplates },
] = createResource(
  () => ({
    search: debouncedSearch(),
    tab: debouncedTab(),
    userId: currentUserId(),
  }),
  fetchFunc,
)
