import { type Item } from '~/modules/diet/item/domain/item'
import {
  createNewRecipe,
  createNewUnifiedRecipe,
  type NewRecipe,
  type NewUnifiedRecipe,
  promoteToRecipe,
  promoteToUnifiedRecipe,
  type Recipe,
  type UnifiedRecipe,
} from '~/modules/diet/recipe/domain/recipe'
import {
  itemToUnifiedItem,
  unifiedItemToItem,
} from '~/modules/diet/unified-item/domain/conversionUtils'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Converts a UnifiedRecipe to a Recipe for database persistence.
 * Flattens UnifiedItem[] to Item[] (food only) for database compatibility.
 *
 * @param unifiedRecipe - The UnifiedRecipe to convert
 * @returns Recipe with Item[] for database storage
 */
export function convertUnifiedRecipeToRecipe(
  unifiedRecipe: UnifiedRecipe,
): Recipe {
  const items: Item[] = unifiedRecipe.items.map(unifiedItemToItem)

  const newRecipe = createNewRecipe({
    name: unifiedRecipe.name,
    owner: unifiedRecipe.owner,
    items,
    preparedMultiplier: unifiedRecipe.prepared_multiplier,
  })

  return promoteToRecipe(newRecipe, unifiedRecipe.id)
}

/**
 * Converts a Recipe to a UnifiedRecipe for in-memory operations.
 * Converts Item[] to UnifiedItem[] for unified operations.
 *
 * @param recipe - The Recipe to convert
 * @returns UnifiedRecipe with UnifiedItem[] for in-memory operations
 */
export function convertRecipeToUnifiedRecipe(recipe: Recipe): UnifiedRecipe {
  const items: UnifiedItem[] = recipe.items.map(itemToUnifiedItem)

  const newUnifiedRecipe = createNewUnifiedRecipe({
    name: recipe.name,
    owner: recipe.owner,
    items,
    preparedMultiplier: recipe.prepared_multiplier,
  })

  return promoteToUnifiedRecipe(newUnifiedRecipe, recipe.id)
}

/**
 * Converts a NewUnifiedRecipe to a NewRecipe for database persistence.
 * Flattens UnifiedItem[] to Item[] (food only) for database compatibility.
 *
 * @param newUnifiedRecipe - The NewUnifiedRecipe to convert
 * @returns NewRecipe with Item[] for database storage
 */
export function convertNewUnifiedRecipeToNewRecipe(
  newUnifiedRecipe: NewUnifiedRecipe,
): NewRecipe {
  const items: Item[] = newUnifiedRecipe.items.map(unifiedItemToItem)

  return createNewRecipe({
    name: newUnifiedRecipe.name,
    owner: newUnifiedRecipe.owner,
    items,
    preparedMultiplier: newUnifiedRecipe.prepared_multiplier,
  })
}

/**
 * Converts a NewRecipe to a NewUnifiedRecipe for in-memory operations.
 * Converts Item[] to UnifiedItem[] for unified operations.
 *
 * @param newRecipe - The NewRecipe to convert
 * @returns NewUnifiedRecipe with UnifiedItem[] for in-memory operations
 */
export function convertNewRecipeToNewUnifiedRecipe(
  newRecipe: NewRecipe,
): NewUnifiedRecipe {
  const items: UnifiedItem[] = newRecipe.items.map(itemToUnifiedItem)

  return createNewUnifiedRecipe({
    name: newRecipe.name,
    owner: newRecipe.owner,
    items,
    preparedMultiplier: newRecipe.prepared_multiplier,
  })
}
