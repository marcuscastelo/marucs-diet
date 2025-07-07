import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchTemplatesByTabLogic,
  type FetchTemplatesDeps,
} from '~/modules/search/application/searchLogic'
import { availableTabs } from '~/sections/search/components/TemplateSearchTabs'

describe('fetchTemplatesByTabLogic', () => {
  const mockFood = { id: 1, name: 'Banana', __type: 'Food', ean: '123' }
  const mockRecipe = { id: 2, name: 'Bolo', __type: 'Recipe' }
  const userId = 1
  let deps: FetchTemplatesDeps

  beforeEach(() => {
    deps = {
      fetchUserRecipes: vi.fn().mockResolvedValue([mockRecipe]),
      fetchUserRecipeByName: vi.fn().mockResolvedValue([mockRecipe]),
      fetchUserRecentFoods: vi.fn().mockResolvedValue([mockFood, mockRecipe]),
      fetchFoods: vi.fn().mockResolvedValue([mockFood]),
      fetchFoodsByName: vi.fn().mockResolvedValue([mockFood]),
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
    deps.fetchUserRecentFoods = vi.fn().mockResolvedValue([mockFood])

    const result = await fetchTemplatesByTabLogic(
      availableTabs.Recentes.id,
      'Banana',
      userId,
      deps,
    )
    expect(result).toEqual([mockFood])
    expect(deps.fetchUserRecentFoods).toHaveBeenCalledWith(
      userId,
      undefined,
      'Banana',
    )
  })

  it('filters by EAN in Recentes tab', async () => {
    // The EAN search should filter client-side since the database function only searches by name
    // Mock the function to return both templates, then expect client-side filtering to work
    deps.fetchUserRecentFoods = vi
      .fn()
      .mockResolvedValue([mockFood, mockRecipe])

    const result = await fetchTemplatesByTabLogic(
      availableTabs.Recentes.id,
      mockFood.ean,
      userId,
      deps,
    )
    expect(result).toEqual([mockFood])
    expect(deps.fetchUserRecentFoods).toHaveBeenCalledWith(
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

  it('calls fetchUserRecentFoods with correct parameters', async () => {
    const result = await fetchTemplatesByTabLogic(
      availableTabs.Recentes.id,
      '',
      userId,
      deps,
    )

    // Verify that fetchUserRecentFoods was called with correct parameters
    expect(deps.fetchUserRecentFoods).toHaveBeenCalledWith(
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
    const largeTemplates = Array.from({ length: LARGE_SIZE }, (_, i) =>
      i % 2 === 0 ? largeFoods[i / 2] : largeRecipes[Math.floor(i / 2)],
    )

    const largeDeps: FetchTemplatesDeps = {
      ...deps,
      fetchUserRecentFoods: vi.fn().mockResolvedValue(largeTemplates),
    }

    // Test that the function completes successfully with large datasets
    // The enhanced function should handle this efficiently
    const result = await fetchTemplatesByTabLogic(
      availableTabs.Recentes.id,
      '',
      userId,
      largeDeps,
    )

    // Verify correct results (should include foods and recipes based on templates)
    expect(result.length).toBe(LARGE_SIZE)
    expect(largeDeps.fetchUserRecentFoods).toHaveBeenCalledWith(
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
