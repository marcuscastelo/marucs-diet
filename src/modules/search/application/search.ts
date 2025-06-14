import { createResource, createSignal } from 'solid-js'

import {
  fetchFoodById as fetchFoodByIdRaw,
  fetchFoods,
  fetchFoodsByIds,
  fetchFoodsByName,
} from '~/modules/diet/food/application/food'
import {
  fetchRecipeById as fetchRecipeByIdRaw,
  fetchUserRecipeByName,
  fetchUserRecipes,
} from '~/modules/diet/recipe/application/recipe'
import { fetchUserRecentFoods as fetchUserRecentFoodsRaw } from '~/modules/recent-food/application/recentFood'
import { fetchTemplatesByTabLogic } from '~/modules/search/application/searchLogic'
import { currentUser, currentUserId } from '~/modules/user/application/user'
import { type TemplateSearchTab } from '~/sections/search/components/TemplateSearchTabs'
import { createDebouncedSignal } from '~/shared/utils/createDebouncedSignal'

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

const getFavoriteFoods = () => currentUser()?.favorite_foods ?? []

const fetchUserRecentFoods = async (userId: number) => {
  const result = await fetchUserRecentFoodsRaw(userId)
  // Adapt to expected type: { type, reference_id, last_used }
  return result.map(({ type, reference_id, last_used }) => ({
    type,
    reference_id,
    last_used,
  }))
}

const fetchFoodById = async (id: number) => {
  const food = await fetchFoodByIdRaw(id)
  if (!food) throw new Error('Food not found')
  return food
}

const fetchRecipeById = async (id: number) => {
  const recipe = await fetchRecipeByIdRaw(id)
  if (!recipe) throw new Error('Recipe not found')
  return recipe
}

export const [
  templates,
  { refetch: refetchTemplates, mutate: mutateTemplates },
] = createResource(
  () => ({
    tab: debouncedTab(),
    search: debouncedSearch(),
    userId: currentUserId(),
  }),
  (signals) => {
    return fetchTemplatesByTabLogic(
      signals.tab,
      signals.search,
      signals.userId,
      {
        fetchUserRecipes,
        fetchUserRecipeByName,
        fetchUserRecentFoods,
        fetchFoodById,
        fetchRecipeById,
        fetchFoods,
        fetchFoodsByName,
        getFavoriteFoods,
        fetchFoodsByIds,
      },
    )
  },
)
