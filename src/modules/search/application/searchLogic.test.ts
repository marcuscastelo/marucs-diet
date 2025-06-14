import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchTemplatesByTabLogic,
  FetchTemplatesDeps,
} from '~/modules/search/application/searchLogic'
import { availableTabs } from '~/sections/search/components/TemplateSearchTabs'

describe('fetchTemplatesByTabLogic', () => {
  const mockFood = { id: 1, name: 'Banana', __type: 'Food', EAN: '123' }
  const mockRecipe = { id: 2, name: 'Bolo', __type: 'Recipe' }
  const mockRecentFood = {
    type: 'food',
    reference_id: 1,
    last_used: new Date(),
  }
  const mockRecentRecipe = {
    type: 'recipe',
    reference_id: 2,
    last_used: new Date(),
  }
  const userId = 1
  let deps: FetchTemplatesDeps

  beforeEach(() => {
    deps = {
      fetchUserRecipes: vi.fn().mockResolvedValue([mockRecipe]),
      fetchUserRecipeByName: vi.fn().mockResolvedValue([mockRecipe]),
      fetchUserRecentFoods: vi
        .fn()
        .mockResolvedValue([mockRecentFood, mockRecentRecipe]),
      fetchFoodById: vi.fn().mockResolvedValue(mockFood),
      fetchRecipeById: vi.fn().mockResolvedValue(mockRecipe),
      fetchFoods: vi.fn().mockResolvedValue([mockFood]),
      fetchFoodsByName: vi.fn().mockResolvedValue([mockFood]),
      fetchFoodsByIds: vi
        .fn()
        .mockImplementation((ids) =>
          Promise.resolve(Array.isArray(ids) ? ids.map(() => mockFood) : []),
        ),
      getFavoriteFoods: () => [1],
    }
  })

  it('fetches recipes for Receitas tab', async () => {
    const result = await fetchTemplatesByTabLogic(
      availableTabs.Receitas.id,
      '',
      userId,
      deps,
    )
    expect(result).toEqual([mockRecipe])
  })

  it('fetches recipes by name for Receitas tab', async () => {
    const result = await fetchTemplatesByTabLogic(
      availableTabs.Receitas.id,
      'Bolo',
      userId,
      deps,
    )
    expect(result).toEqual([mockRecipe])
  })

  it('fetches recent foods and recipes for Recentes tab', async () => {
    const result = await fetchTemplatesByTabLogic(
      availableTabs.Recentes.id,
      '',
      userId,
      deps,
    )
    expect(result).toEqual([mockFood, mockRecipe])
  })

  it('fetches favorite foods for Favoritos tab', async () => {
    const result = await fetchTemplatesByTabLogic(
      availableTabs.Favoritos.id,
      '',
      userId,
      deps,
    )
    expect(result).toEqual([mockFood])
  })

  it('fetches foods for Todos tab', async () => {
    const result = await fetchTemplatesByTabLogic(
      availableTabs.Todos.id,
      '',
      userId,
      deps,
    )
    expect(result).toEqual([mockFood])
  })

  it('filters by search string in Recentes tab', async () => {
    const result = await fetchTemplatesByTabLogic(
      availableTabs.Recentes.id,
      'Banana',
      userId,
      deps,
    )
    expect(result).toEqual([mockFood])
  })

  it('filters by EAN in Recentes tab', async () => {
    const result = await fetchTemplatesByTabLogic(
      availableTabs.Recentes.id,
      mockFood.EAN,
      userId,
      deps,
    )
    expect(result).toEqual([mockFood])
  })

  it('calls fetchFoodsByName with correct args for Todos tab and non-empty search', async () => {
    const search = 'Banana'
    await fetchTemplatesByTabLogic(availableTabs.Todos.id, search, userId, deps)
    expect(deps.fetchFoodsByName).toHaveBeenCalledWith(search, { limit: 50 })
  })
})
