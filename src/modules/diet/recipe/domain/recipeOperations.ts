import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

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

export function addItemToRecipe(recipe: Recipe, item: UnifiedItem): Recipe {
  return {
    ...recipe,
    items: [...recipe.items, item],
  }
}

export function addItemsToRecipe(
  recipe: Recipe,
  items: readonly UnifiedItem[],
): Recipe {
  return {
    ...recipe,
    items: [...recipe.items, ...items],
  }
}

export function updateItemInRecipe(
  recipe: Recipe,
  itemId: UnifiedItem['id'],
  updatedItem: UnifiedItem,
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
  itemId: UnifiedItem['id'],
): Recipe {
  return {
    ...recipe,
    items: recipe.items.filter((item) => item.id !== itemId),
  }
}

export function setRecipeItems(recipe: Recipe, items: UnifiedItem[]): Recipe {
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
  itemId: UnifiedItem['id'],
): UnifiedItem | undefined {
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

/**
 * Calculates the total raw quantity of a recipe by summing all item quantities.
 * This represents the total weight of ingredients before preparation.
 *
 * @param recipe - The recipe to calculate raw quantity for
 * @returns The total raw quantity in grams
 */
export function getRecipeRawQuantity(recipe: Recipe): number {
  return recipe.items.reduce((total, item) => total + item.quantity, 0)
}

/**
 * Calculates the prepared quantity of a recipe using the prepared multiplier.
 * This represents the total weight after preparation (cooking, processing, etc.).
 *
 * @param recipe - The recipe to calculate prepared quantity for
 * @returns The total prepared quantity in grams
 */
export function getRecipePreparedQuantity(recipe: Recipe): number {
  const rawQuantity = getRecipeRawQuantity(recipe)
  return rawQuantity * recipe.prepared_multiplier
}

/**
 * Scales a recipe's items based on a desired prepared quantity.
 * This function calculates how much of the recipe is needed to achieve
 * the desired prepared weight and scales all ingredients accordingly.
 *
 * @param recipe - The recipe to scale
 * @param desiredPreparedQuantity - The desired prepared quantity in grams
 * @returns Object containing scaled items and the scaling factor used
 */
export function scaleRecipeByPreparedQuantity(
  recipe: Recipe,
  desiredPreparedQuantity: number,
): { scaledItems: UnifiedItem[]; scalingFactor: number } {
  const preparedQuantity = getRecipePreparedQuantity(recipe)

  if (preparedQuantity <= 0) {
    throw new Error('Recipe prepared quantity must be greater than 0')
  }

  if (desiredPreparedQuantity < 0) {
    throw new Error('Desired prepared quantity must be non-negative')
  }

  const scalingFactor = desiredPreparedQuantity / preparedQuantity

  const scaledItems = recipe.items.map(
    (item): UnifiedItem => ({
      ...item,
      quantity: item.quantity * scalingFactor,
    }),
  )

  return {
    scaledItems,
    scalingFactor,
  }
}

/**
 * Creates a scaled version of a recipe with a specific prepared quantity.
 * This is useful when you want to create a portion of a recipe.
 *
 * @param recipe - The original recipe
 * @param desiredPreparedQuantity - The desired prepared quantity in grams
 * @returns A new recipe with scaled items and updated prepared multiplier
 */
export function createScaledRecipe(
  recipe: Recipe,
  desiredPreparedQuantity: number,
): Recipe {
  const { scaledItems } = scaleRecipeByPreparedQuantity(
    recipe,
    desiredPreparedQuantity,
  )

  return {
    ...recipe,
    items: scaledItems,
    // The prepared multiplier remains the same since it's a ratio
    // The new raw quantity will be scaled, but the multiplier stays constant
  }
}
