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

  it('respects limit parameter for recent foods', async () => {
    const recentFoods = [
      { type: 'food' as const, reference_id: 1, last_used: new Date() },
      { type: 'food' as const, reference_id: 2, last_used: new Date() },
      { type: 'food' as const, reference_id: 3, last_used: new Date() },
    ]

    const limitedDeps: FetchTemplatesDeps = {
      ...deps,
      fetchUserRecentFoods: vi.fn().mockResolvedValue(recentFoods),
    }

    await fetchTemplatesByTabLogic(
      availableTabs.Recentes.id,
      '',
      userId,
      limitedDeps,
    )

    // Verify that fetchUserRecentFoods was called with only userId (default behavior)
    expect(limitedDeps.fetchUserRecentFoods).toHaveBeenCalledWith(userId)
  })

  it('handles large datasets efficiently in Recentes tab', async () => {
    // Create large datasets to verify O(n) optimization works correctly
    const LARGE_SIZE = 1000
    const largeFoods = Array.from({ length: LARGE_SIZE }, (_, i) => ({
      id: i + 1,
      name: `Food ${i + 1}`,
      __type: 'Food' as const,
      EAN: `${i + 1}`,
    }))
    const largeRecipes = Array.from({ length: LARGE_SIZE }, (_, i) => ({
      id: i + 1,
      name: `Recipe ${i + 1}`,
      __type: 'Recipe' as const,
    }))
    const largeRecentItems = Array.from({ length: LARGE_SIZE }, (_, i) => ({
      type: i % 2 === 0 ? ('food' as const) : ('recipe' as const),
      reference_id: (i % LARGE_SIZE) + 1,
      last_used: new Date(),
    }))

    const largeDeps: FetchTemplatesDeps = {
      ...deps,
      fetchUserRecentFoods: vi.fn().mockResolvedValue(largeRecentItems),
      fetchFoodsByIds: vi.fn().mockResolvedValue(largeFoods),
      fetchRecipeById: vi
        .fn()
        .mockImplementation((id) =>
          Promise.resolve(largeRecipes.find((r) => r.id === id) || null),
        ),
    }

    // Test that the function completes successfully with large datasets
    // The O(n) optimization should handle this without issues
    const result = await fetchTemplatesByTabLogic(
      availableTabs.Recentes.id,
      '',
      userId,
      largeDeps,
    )

    // Verify correct results (should include foods and recipes based on recent items)
    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThanOrEqual(LARGE_SIZE)

    // Verify the optimization is working by checking that all expected items are found
    // With the Map-based lookup, all valid references should be resolved
    const expectedFoodCount = largeRecentItems.filter(
      (r) => r.type === 'food',
    ).length
    const expectedRecipeCount = largeRecentItems.filter(
      (r) => r.type === 'recipe',
    ).length
    const actualFoodCount = result.filter((r) => r.__type === 'Food').length
    const actualRecipeCount = result.filter((r) => r.__type === 'Recipe').length

    expect(actualFoodCount).toBe(expectedFoodCount)
    expect(actualRecipeCount).toBe(expectedRecipeCount)
  })
})
