import { Item } from '~/modules/diet/item/domain/item'
import type { ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { getItemGroupQuantity } from '~/modules/diet/item-group/domain/itemGroup'
import { Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  createUnifiedItem,
  isFood,
  UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Converts an Item to a UnifiedItem (food reference).
 * @param item Item
 * @returns UnifiedItem
 */
export function itemToUnifiedItem(item: Item): UnifiedItem {
  return createUnifiedItem({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    reference: { type: 'food', id: item.reference, macros: item.macros },
  })
}

/**
 * Converts a UnifiedItem to an Item.
 * For food items, uses the stored macros (per 100g) from reference. For non-food items, uses zero macros.
 * @param unified UnifiedItem
 * @returns Item
 */
export function unifiedItemToItem(unified: UnifiedItem): Item {
  return {
    id: unified.id,
    name: unified.name,
    quantity: unified.quantity,
    macros: isFood(unified)
      ? unified.reference.macros
      : { carbs: 0, protein: 0, fat: 0 },
    reference: isFood(unified) ? unified.reference.id : 0,
    __type: 'Item',
  }
}

/**
 * Converts a SimpleItemGroup or RecipedItemGroup to a UnifiedItem.
 * Creates a recipe reference if the group has a recipe field, otherwise creates a group reference.
 * @param group ItemGroup
 * @returns UnifiedItem
 */
export function itemGroupToUnifiedItem(group: ItemGroup): UnifiedItem {
  const children = group.items.map((item) => itemToUnifiedItem(item))

  if (group.recipe !== undefined) {
    // Recipe UnifiedItem - no macros stored
    return createUnifiedItem({
      id: group.id,
      name: group.name,
      quantity: getItemGroupQuantity(group),
      reference: { type: 'recipe', id: group.recipe, children },
    })
  } else {
    // Group UnifiedItem - no macros stored
    return createUnifiedItem({
      id: group.id,
      name: group.name,
      quantity: getItemGroupQuantity(group),
      reference: { type: 'group', children },
    })
  }
}

/**
 * Checks if a UnifiedItem of type recipe has been manually edited (differs from original recipe).
 * Similar to isRecipedGroupUpToDate but for UnifiedItems.
 * @param item UnifiedItem with recipe reference
 * @param originalRecipe The original Recipe to compare against
 * @returns true if the item was manually edited (not up to date)
 */
export function isRecipeUnifiedItemManuallyEdited(
  item: UnifiedItem,
  originalRecipe: {
    items: ReadonlyArray<{ reference: number; quantity: number }>
  },
): boolean {
  if (item.reference.type !== 'recipe') {
    return false // Not a recipe item
  }

  const recipeChildren = item.reference.children
  const originalItems = originalRecipe.items

  // Different number of items means it was edited
  if (recipeChildren.length !== originalItems.length) {
    return true
  }

  // Check each item for differences
  for (let i = 0; i < recipeChildren.length; i++) {
    const childItem = recipeChildren[i]
    const originalItem = originalItems[i]

    if (childItem === undefined || originalItem === undefined) {
      return true // Something is wrong, consider it edited
    }

    // Only check food items (recipes in recipes not supported yet)
    if (childItem.reference.type !== 'food') {
      continue
    }

    // Check if reference ID or quantity differs
    if (
      childItem.reference.id !== originalItem.reference ||
      childItem.quantity !== originalItem.quantity
    ) {
      return true
    }
  }

  return false // No differences found
}

/**
 * Synchronizes a recipe UnifiedItem with its original recipe data.
 * Preserves the item's quantity but updates the children to match the original recipe.
 * @param item UnifiedItem with recipe reference
 * @param originalRecipe The original Recipe to sync with
 * @returns Updated UnifiedItem with synchronized children
 */
export function syncRecipeUnifiedItemWithOriginal(
  item: UnifiedItem,
  originalRecipe: Recipe,
): UnifiedItem {
  if (item.reference.type !== 'recipe') {
    return item // Not a recipe item, return as-is
  }

  const syncedChildren: UnifiedItem[] = originalRecipe.items.map(
    (originalItem) => itemToUnifiedItem(originalItem),
  )

  return createUnifiedItem({
    id: item.id,
    name: item.name,
    quantity: syncedChildren.reduce(
      (total, child) => total + child.quantity,
      0,
    ),
    reference: {
      type: 'recipe',
      id: item.reference.id,
      children: syncedChildren,
    },
  })
}
