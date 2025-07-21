import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

/**
 * Updates the name of a UnifiedItem
 */
export function updateUnifiedItemName(
  item: UnifiedItem,
  newName: string,
): UnifiedItem {
  return {
    ...item,
    name: newName,
  }
}

/**
 * Compares two arrays of UnifiedItems to detect differences
 * Used to determine if a recipe has been manually edited
 */
export function compareUnifiedItemArrays(
  originalItems: readonly UnifiedItem[],
  currentItems: readonly UnifiedItem[],
): boolean {
  // If lengths are different, items were added/removed
  if (originalItems.length !== currentItems.length) {
    return false
  }

  // Compare each item by sorting both arrays by ID first to handle reordering
  const sortById = (items: readonly UnifiedItem[]) =>
    [...items].sort((a, b) => a.id - b.id)

  const sortedOriginal = sortById(originalItems)
  const sortedCurrent = sortById(currentItems)

  for (let i = 0; i < sortedOriginal.length; i++) {
    const original = sortedOriginal[i]!
    const current = sortedCurrent[i]!

    // Compare essential properties that indicate manual editing
    if (
      original.id !== current.id ||
      original.name !== current.name ||
      original.quantity !== current.quantity ||
      original.reference.type !== current.reference.type
    ) {
      return false
    }

    // For food items, compare macros
    if (
      original.reference.type === 'food' &&
      current.reference.type === 'food'
    ) {
      const originalMacros = original.reference.macros
      const currentMacros = current.reference.macros

      if (
        originalMacros.protein !== currentMacros.protein ||
        originalMacros.carbs !== currentMacros.carbs ||
        originalMacros.fat !== currentMacros.fat
      ) {
        return false
      }
    }

    // For recipe and group items, recursively compare children
    if (
      (original.reference.type === 'recipe' &&
        current.reference.type === 'recipe') ||
      (original.reference.type === 'group' &&
        current.reference.type === 'group')
    ) {
      if (
        !compareUnifiedItemArrays(
          original.reference.children,
          current.reference.children,
        )
      ) {
        return false
      }
    }
  }

  return true
}

/**
 * Generates a unique ID for UnifiedItems
 * Uses current timestamp + random number to avoid collisions
 */
export function generateUnifiedItemId(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

/**
 * Creates a new UnifiedItem with regenerated IDs to avoid conflicts
 * Recursively regenerates IDs for children in recipe/group items
 */
export function regenerateUnifiedItemIds(item: UnifiedItem): UnifiedItem {
  const newId = generateUnifiedItemId()

  if (item.reference.type === 'food') {
    return {
      ...item,
      id: newId,
    }
  }

  if (item.reference.type === 'recipe') {
    return {
      ...item,
      id: newId,
      reference: {
        ...item.reference,
        children: item.reference.children.map((child) =>
          regenerateUnifiedItemIds(child),
        ),
      },
    }
  }

  if (item.reference.type === 'group') {
    return {
      ...item,
      id: newId,
      reference: {
        ...item.reference,
        children: item.reference.children.map((child) =>
          regenerateUnifiedItemIds(child),
        ),
      },
    }
  }

  // TypeScript exhaustiveness check
  const _exhaustiveCheck: never = item.reference
  return _exhaustiveCheck
}

/**
 * Synchronizes a RecipeItem with its original recipe by replacing
 * the current children with the original recipe items (with new IDs)
 */
export function synchronizeRecipeItemWithOriginal(
  recipeItem: UnifiedItem,
  originalRecipeItems: readonly UnifiedItem[],
): UnifiedItem {
  if (recipeItem.reference.type !== 'recipe') {
    throw new Error('Can only synchronize recipe items')
  }

  // Regenerate IDs for all original items to avoid conflicts
  const syncedChildren = originalRecipeItems.map((item) =>
    regenerateUnifiedItemIds(item),
  )

  return {
    ...recipeItem,
    reference: {
      ...recipeItem.reference,
      children: syncedChildren,
    },
  }
}
