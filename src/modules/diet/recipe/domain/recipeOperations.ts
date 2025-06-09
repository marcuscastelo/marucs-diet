import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'

/**
 * Pure functions for recipe operations
 * Replaces the deprecated RecipeEditor pattern
 */

export function updateRecipeName(recipe: Recipe, name: string): Recipe {
  return {
    ...recipe,
    name,
  }
}

export function updateRecipePreparedMultiplier(
  recipe: Recipe,
  preparedMultiplier: number,
): Recipe {
  return {
    ...recipe,
    prepared_multiplier: preparedMultiplier,
  }
}

export function addItemToRecipe(recipe: Recipe, item: Item): Recipe {
  return {
    ...recipe,
    items: [...recipe.items, item],
  }
}

export function addItemsToRecipe(
  recipe: Recipe,
  items: readonly Item[],
): Recipe {
  return {
    ...recipe,
    items: [...recipe.items, ...items],
  }
}

export function updateItemInRecipe(
  recipe: Recipe,
  itemId: Item['id'],
  updatedItem: Item,
): Recipe {
  return {
    ...recipe,
    items: recipe.items.map((item) =>
      item.id === itemId ? updatedItem : item,
    ),
  }
}

export function removeItemFromRecipe(
  recipe: Recipe,
  itemId: Item['id'],
): Recipe {
  return {
    ...recipe,
    items: recipe.items.filter((item) => item.id !== itemId),
  }
}

export function setRecipeItems(recipe: Recipe, items: Item[]): Recipe {
  return {
    ...recipe,
    items,
  }
}

export function clearRecipeItems(recipe: Recipe): Recipe {
  return {
    ...recipe,
    items: [],
  }
}

export function findItemInRecipe(
  recipe: Recipe,
  itemId: Item['id'],
): Item | undefined {
  return recipe.items.find((item) => item.id === itemId)
}

export function replaceRecipe(
  recipe: Recipe,
  updates: Partial<Recipe>,
): Recipe {
  return {
    ...recipe,
    ...updates,
  }
}
