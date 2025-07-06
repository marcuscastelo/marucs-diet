import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchTemplatesByTabLogic,
  FetchTemplatesDeps,
} from '~/modules/search/application/searchLogic'
import { availableTabs } from '~/sections/search/components/TemplateSearchTabs'

describe('fetchTemplatesByTabLogic', () => {
  const mockFood = { id: 1, name: 'Banana', __type: 'Food', ean: '123' }
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
  const mockRecentTemplate1 = {
    template: mockFood,
    usage_metadata: {
      recent_food_id: 1,
      last_used: new Date(),
      times_used: 3,
    },
    __type: 'RecentTemplate',
  }
  const mockRecentTemplate2 = {
    template: mockRecipe,
    usage_metadata: {
      recent_food_id: 2,
      last_used: new Date(),
      times_used: 5,
    },
    __type: 'RecentTemplate',
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
      fetchUserRecentTemplates: vi
        .fn()
        .mockResolvedValue([mockRecentTemplate1, mockRecentTemplate2]),
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
    // Mock the function to return only the food template for search "Banana"
    deps.fetchUserRecentTemplates = vi
      .fn()
      .mockResolvedValue([mockRecentTemplate1])

    const result = await fetchTemplatesByTabLogic(
      availableTabs.Recentes.id,
      'Banana',
      userId,
      deps,
    )
    expect(result).toEqual([mockFood])
    expect(deps.fetchUserRecentTemplates).toHaveBeenCalledWith(
      userId,
      undefined,
      'Banana',
    )
  })

  it('filters by EAN in Recentes tab', async () => {
    // The EAN search should filter client-side since the database function only searches by name
    // Mock the function to return both templates, then expect client-side filtering to work
    deps.fetchUserRecentTemplates = vi
      .fn()
      .mockResolvedValue([mockRecentTemplate1, mockRecentTemplate2])

    const result = await fetchTemplatesByTabLogic(
      availableTabs.Recentes.id,
      mockFood.ean,
      userId,
      deps,
    )
    expect(result).toEqual([mockFood])
    expect(deps.fetchUserRecentTemplates).toHaveBeenCalledWith(
      userId,
      undefined,
      mockFood.ean,
    )
  })

  it('calls fetchFoodsByName with correct args for Todos tab and non-empty search', async () => {
    const search = 'Banana'
    await fetchTemplatesByTabLogic(availableTabs.Todos.id, search, userId, deps)
    expect(deps.fetchFoodsByName).toHaveBeenCalledWith(search, { limit: 50 })
  })

  it('calls fetchUserRecentTemplates with correct parameters', async () => {
    const result = await fetchTemplatesByTabLogic(
      availableTabs.Recentes.id,
      '',
      userId,
      deps,
    )

    // Verify that fetchUserRecentTemplates was called with correct parameters
    expect(deps.fetchUserRecentTemplates).toHaveBeenCalledWith(
      userId,
      undefined,
      '',
    )
    expect(result).toEqual([mockFood, mockRecipe])
  })

  it('handles large datasets efficiently in Recentes tab', async () => {
    // Create large datasets to verify enhanced function works correctly
    const LARGE_SIZE = 1000
    const largeFoods = Array.from({ length: LARGE_SIZE }, (_, i) => ({
      id: i + 1,
      name: `Food ${i + 1}`,
      __type: 'Food' as const,
      ean: `${i + 1}`,
    }))
    const largeRecipes = Array.from({ length: LARGE_SIZE }, (_, i) => ({
      id: i + 1,
      name: `Recipe ${i + 1}`,
      __type: 'Recipe' as const,
    }))
    const largeRecentTemplates = Array.from({ length: LARGE_SIZE }, (_, i) => ({
      template:
        i % 2 === 0 ? largeFoods[i / 2] : largeRecipes[Math.floor(i / 2)],
      usage_metadata: {
        recent_food_id: i + 1,
        last_used: new Date(),
        times_used: Math.floor(Math.random() * 10) + 1,
      },
      __type: 'RecentTemplate' as const,
    }))

    const largeDeps: FetchTemplatesDeps = {
      ...deps,
      fetchUserRecentTemplates: vi.fn().mockResolvedValue(largeRecentTemplates),
    }

    // Test that the function completes successfully with large datasets
    // The enhanced function should handle this efficiently
    const result = await fetchTemplatesByTabLogic(
      availableTabs.Recentes.id,
      '',
      userId,
      largeDeps,
    )

    // Verify correct results (should include foods and recipes based on recent templates)
    expect(result.length).toBe(LARGE_SIZE)
    expect(largeDeps.fetchUserRecentTemplates).toHaveBeenCalledWith(
      userId,
      undefined,
      '',
    )

    // Verify that we get the correct mix of foods and recipes
    const actualFoodCount = result.filter((r) => r.__type === 'Food').length
    const actualRecipeCount = result.filter((r) => r.__type === 'Recipe').length
    const expectedFoodCount = Math.ceil(LARGE_SIZE / 2)
    const expectedRecipeCount = Math.floor(LARGE_SIZE / 2)

    expect(actualFoodCount).toBe(expectedFoodCount)
    expect(actualRecipeCount).toBe(expectedRecipeCount)
  })
})
