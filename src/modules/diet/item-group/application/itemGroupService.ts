import { type ItemGroup, type RecipedItemGroup, createSimpleItemGroup, createRecipedItemGroup } from '../domain/itemGroup'
import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'

export type GroupConvertible =
  | ItemGroup
  | ItemGroup[]
  | { groups: ItemGroup[] }
  | Item
  | Recipe

/**
 * Converts various group-like objects into an array of ItemGroups.
 * Uses proper type checking instead of string-based detection.
 */
export function convertToGroups(convertible: GroupConvertible): ItemGroup[] {
  if (Array.isArray(convertible)) {
    return [...convertible]
  }

  if (isRecipe(convertible)) {
    return [
      createRecipedItemGroup({
        name: convertible.name,
        items: [...convertible.items],
        recipe: convertible.id,
      }),
    ]
  }

  if (hasGroups(convertible)) {
    return [...convertible.groups]
  }

  if (isItem(convertible)) {
    return [
      createSimpleItemGroup({
        name: convertible.name,
        items: [{ ...convertible }],
      }),
    ]
  }

  if (isItemGroup(convertible)) {
    return [{ ...convertible }]
  }

  throw new Error(
    `Unsupported convertible type: ${getTypeDescription(convertible)}`
  )
}

function isRecipe(obj: any): obj is Recipe {
  return obj && typeof obj === 'object' && obj.__type === 'Recipe'
}

function hasGroups(obj: any): obj is { groups: ItemGroup[] } {
  return obj && typeof obj === 'object' && Array.isArray(obj.groups)
}

function isItem(obj: any): obj is Item {
  return obj && typeof obj === 'object' && 'reference' in obj
}

function isItemGroup(obj: any): obj is ItemGroup {
  return obj && typeof obj === 'object' && 'items' in obj && !('groups' in obj)
}

function getTypeDescription(obj: any): string {
  if (obj === null) return 'null'
  if (obj === undefined) return 'undefined'
  if (typeof obj !== 'object') return typeof obj

  const constructor = obj.constructor?.name
  const type = obj.__type

  return type || constructor || 'unknown object'
}
