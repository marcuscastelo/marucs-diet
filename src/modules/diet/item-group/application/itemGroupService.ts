import { type ItemGroup, createSimpleItemGroup, createRecipedItemGroup } from '../domain/itemGroup'
import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { handleApiError } from '~/shared/error/errorHandler'

export type GroupConvertible =
  | ItemGroup
  | ItemGroup[]
  | { groups: ItemGroup[] }
  | Item
  | Recipe

/**
 * Converts various group-like objects into an array of ItemGroups.
 *
 * Accepts:
 * - ItemGroup
 * - ItemGroup[]
 * - { groups: ItemGroup[] }
 * - Item
 * - Recipe
 *
 * @param convertible - The object to convert (see accepted types above)
 * @returns Array of ItemGroup
 */
export function convertToGroups(convertible: GroupConvertible): ItemGroup[] {
  if (Array.isArray(convertible)) {
    // Defensive: filter only valid ItemGroups
    return (convertible as unknown[]).filter(isItemGroup) as ItemGroup[]
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

  handleApiError(new Error(`Unsupported convertible type: ${getTypeDescription(convertible)}`), {
    component: 'itemGroupService',
    operation: 'convertToGroups',
    additionalData: { input: convertible }
  })
  return []
}

function isRecipe(obj: unknown): obj is Recipe {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    '__type' in obj &&
    (obj as any).__type === 'Recipe'
  )
}

function hasGroups(obj: unknown): obj is { groups: ItemGroup[] } {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    Array.isArray((obj as any).groups)
  )
}

function isItem(obj: unknown): obj is Item {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'reference' in obj
  )
}

function isItemGroup(obj: unknown): obj is ItemGroup {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'items' in obj &&
    !('groups' in obj)
  )
}

function getTypeDescription(obj: unknown): string {
  if (obj === null) return 'null'
  if (obj === undefined) return 'undefined'
  if (typeof obj !== 'object') return typeof obj
  const constructor = (obj as any).constructor?.name
  const type = (obj as any).__type
  return type || constructor || 'unknown object'
}
