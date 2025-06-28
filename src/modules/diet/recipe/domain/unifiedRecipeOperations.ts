import { type UnifiedRecipe } from '~/modules/diet/recipe/domain/recipe'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Updates the name of a UnifiedRecipe.
 *
 * @param recipe - The recipe to update
 * @param name - The new name
 * @returns Updated UnifiedRecipe
 */
export function updateUnifiedRecipeName(
  recipe: UnifiedRecipe,
  name: string,
): UnifiedRecipe {
  return {
    ...recipe,
    name,
  }
}

/**
 * Updates the prepared multiplier of a UnifiedRecipe.
 *
 * @param recipe - The recipe to update
 * @param preparedMultiplier - The new prepared multiplier
 * @returns Updated UnifiedRecipe
 */
export function updateUnifiedRecipePreparedMultiplier(
  recipe: UnifiedRecipe,
  preparedMultiplier: number,
): UnifiedRecipe {
  return {
    ...recipe,
    prepared_multiplier: preparedMultiplier,
  }
}

/**
 * Adds a UnifiedItem to a UnifiedRecipe.
 *
 * @param recipe - The recipe to add the item to
 * @param item - The UnifiedItem to add
 * @returns Updated UnifiedRecipe with the new item
 */
export function addUnifiedItemToRecipe(
  recipe: UnifiedRecipe,
  item: UnifiedItem,
): UnifiedRecipe {
  return {
    ...recipe,
    items: [...recipe.items, item],
  }
}

/**
 * Adds multiple UnifiedItems to a UnifiedRecipe.
 *
 * @param recipe - The recipe to add items to
 * @param items - The UnifiedItems to add
 * @returns Updated UnifiedRecipe with the new items
 */
export function addUnifiedItemsToRecipe(
  recipe: UnifiedRecipe,
  items: readonly UnifiedItem[],
): UnifiedRecipe {
  return {
    ...recipe,
    items: [...recipe.items, ...items],
  }
}

/**
 * Updates a UnifiedItem in a UnifiedRecipe.
 *
 * @param recipe - The recipe to update
 * @param itemId - The ID of the item to update
 * @param updatedItem - The updated UnifiedItem
 * @returns Updated UnifiedRecipe with the modified item
 */
export function updateUnifiedItemInRecipe(
  recipe: UnifiedRecipe,
  itemId: UnifiedItem['id'],
  updatedItem: UnifiedItem,
): UnifiedRecipe {
  return {
    ...recipe,
    items: recipe.items.map((item) =>
      item.id === itemId ? updatedItem : item,
    ),
  }
}

/**
 * Removes a UnifiedItem from a UnifiedRecipe.
 *
 * @param recipe - The recipe to remove the item from
 * @param itemId - The ID of the item to remove
 * @returns Updated UnifiedRecipe without the specified item
 */
export function removeUnifiedItemFromRecipe(
  recipe: UnifiedRecipe,
  itemId: UnifiedItem['id'],
): UnifiedRecipe {
  return {
    ...recipe,
    items: recipe.items.filter((item) => item.id !== itemId),
  }
}

/**
 * Sets the items of a UnifiedRecipe.
 *
 * @param recipe - The recipe to update
 * @param items - The new UnifiedItems array
 * @returns Updated UnifiedRecipe with the new items
 */
export function setUnifiedRecipeItems(
  recipe: UnifiedRecipe,
  items: UnifiedItem[],
): UnifiedRecipe {
  return {
    ...recipe,
    items,
  }
}

/**
 * Clears all items from a UnifiedRecipe.
 *
 * @param recipe - The recipe to clear
 * @returns Updated UnifiedRecipe with empty items array
 */
export function clearUnifiedRecipeItems(recipe: UnifiedRecipe): UnifiedRecipe {
  return {
    ...recipe,
    items: [],
  }
}

/**
 * Finds a UnifiedItem in a UnifiedRecipe by ID.
 *
 * @param recipe - The recipe to search in
 * @param itemId - The ID of the item to find
 * @returns The found UnifiedItem or undefined
 */
export function findUnifiedItemInRecipe(
  recipe: UnifiedRecipe,
  itemId: UnifiedItem['id'],
): UnifiedItem | undefined {
  return recipe.items.find((item) => item.id === itemId)
}

/**
 * Replaces parts of a UnifiedRecipe with new values.
 *
 * @param recipe - The recipe to update
 * @param updates - Partial updates to apply
 * @returns Updated UnifiedRecipe
 */
export function replaceUnifiedRecipe(
  recipe: UnifiedRecipe,
  updates: Partial<UnifiedRecipe>,
): UnifiedRecipe {
  return {
    ...recipe,
    ...updates,
  }
}

/**
 * Calculates the total raw quantity of a UnifiedRecipe by summing all item quantities.
 * This represents the total weight of ingredients before preparation.
 *
 * @param recipe - The recipe to calculate raw quantity for
 * @returns The total raw quantity in grams
 */
export function getUnifiedRecipeRawQuantity(recipe: UnifiedRecipe): number {
  return recipe.items.reduce((total, item) => total + item.quantity, 0)
}

/**
 * Calculates the prepared quantity of a UnifiedRecipe using the prepared multiplier.
 * This represents the total weight after preparation (cooking, processing, etc.).
 *
 * @param recipe - The recipe to calculate prepared quantity for
 * @returns The total prepared quantity in grams
 */
export function getUnifiedRecipePreparedQuantity(
  recipe: UnifiedRecipe,
): number {
  const rawQuantity = getUnifiedRecipeRawQuantity(recipe)
  return rawQuantity * recipe.prepared_multiplier
}

/**
 * Scales a UnifiedRecipe's items based on a desired prepared quantity.
 * This function calculates how much of the recipe is needed to achieve
 * the desired prepared weight and scales all ingredients accordingly.
 *
 * @param recipe - The recipe to scale
 * @param desiredPreparedQuantity - The desired prepared quantity in grams
 * @returns Object containing scaled items and the scaling factor used
 */
export function scaleUnifiedRecipeByPreparedQuantity(
  recipe: UnifiedRecipe,
  desiredPreparedQuantity: number,
): { scaledItems: UnifiedItem[]; scalingFactor: number } {
  const preparedQuantity = getUnifiedRecipePreparedQuantity(recipe)

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
