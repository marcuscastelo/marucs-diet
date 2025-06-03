import { type Item } from '~/modules/diet/item/domain/item'
import { type ItemGroup } from './itemGroup'

/**
 * Pure functions for item group operations
 * Replaces the deprecated ItemGroupEditor pattern
 */

export function updateItemGroupName(group: ItemGroup, name: string): ItemGroup {
  return {
    ...group,
    name,
  }
}

export function setItemGroupRecipe(
  group: ItemGroup,
  recipeId: ItemGroup['recipe'],
): ItemGroup {
  if (recipeId === undefined) {
    return {
      ...group,
      type: 'simple' as const,
      recipe: undefined,
      items: [...group.items],
    }
  }
  return {
    ...group,
    type: 'recipe' as const,
    recipe: recipeId,
    items: [...group.items],
  }
}

export function addItemToGroup(group: ItemGroup, item: Item): ItemGroup {
  return {
    ...group,
    items: [...group.items, item],
  }
}

export function addItemsToGroup(
  group: ItemGroup,
  items: readonly Item[],
): ItemGroup {
  return {
    ...group,
    items: [...group.items, ...items],
  }
}

export function updateItemInGroup(
  group: ItemGroup,
  itemId: Item['id'],
  updatedItem: Item,
): ItemGroup {
  return {
    ...group,
    items: group.items.map((item) => (item.id === itemId ? updatedItem : item)),
  }
}

export function removeItemFromGroup(
  group: ItemGroup,
  itemId: Item['id'],
): ItemGroup {
  return {
    ...group,
    items: group.items.filter((item) => item.id !== itemId),
  }
}

export function setItemGroupItems(
  group: ItemGroup,
  items: readonly Item[],
): ItemGroup {
  return {
    ...group,
    items: items as Item[],
  }
}

export function clearItemGroupItems(group: ItemGroup): ItemGroup {
  return {
    ...group,
    items: [],
  }
}

export function findItemInGroup(
  group: ItemGroup,
  itemId: Item['id'],
): Item | undefined {
  return group.items.find((item) => item.id === itemId)
}

export function replaceItemGroup(
  group: ItemGroup,
  updates: Partial<ItemGroup>,
): ItemGroup {
  // Handle items array separately to ensure proper typing
  const items = updates.items ? [...updates.items] : [...group.items]

  // Create the base result without items first
  const { items: _omittedItems, ...updatesWithoutItems } = updates
  const baseResult = {
    ...group,
    ...updatesWithoutItems,
    items,
  }

  return baseResult as ItemGroup
}
