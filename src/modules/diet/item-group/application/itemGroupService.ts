import {
  type ItemGroup,
  createSimpleItemGroup,
  createRecipedItemGroup,
  itemGroupSchema,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Item, itemSchema } from '~/modules/diet/item/domain/item'
import { type Recipe, recipeSchema } from '~/modules/diet/recipe/domain/recipe'
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
 * If the input is not convertible, logs the error and returns an empty array.
 *
 * @param convertible - The object to convert (see accepted types above)
 * @returns Array of ItemGroup (empty if input is not convertible)
 */
export function convertToGroups(convertible: GroupConvertible): ItemGroup[] {
  if (Array.isArray(convertible)) {
    // Defensive: filter only valid ItemGroups
    return convertible.filter(isItemGroup)
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
  handleApiError(
    new Error(
      `Unsupported convertible type: ${getTypeDescription(convertible)}`,
    ),
    {
      component: 'itemGroupService',
      operation: 'convertToGroups',
      additionalData: { input: convertible },
    },
  )
  // Defensive: always return an empty array for unsupported input
  return []
}

function isRecipe(obj: unknown): obj is Recipe {
  return recipeSchema.safeParse(obj).success
}

function hasGroups(obj: unknown): obj is { groups: ItemGroup[] } {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    Array.isArray((obj as Record<string, unknown>).groups)
  )
}

function isItem(obj: unknown): obj is Item {
  return itemSchema.safeParse(obj).success
}

function isItemGroup(obj: unknown): obj is ItemGroup {
  return itemGroupSchema.safeParse(obj).success
}

function getTypeDescription(obj: unknown): string {
  if (obj === null) return 'null'
  if (obj === undefined) return 'undefined'
  if (typeof obj !== 'object') return typeof obj
  if (
    Object.prototype.hasOwnProperty.call(obj, '__type') &&
    typeof (obj as Record<string, unknown>)['__type'] === 'string'
  ) {
    return String((obj as Record<string, unknown>)['__type'])
  }
  // Check for constructor name safely
  const maybeObj = obj as { constructor?: { name?: string } }
  if (
    maybeObj.constructor &&
    typeof maybeObj.constructor.name === 'string' &&
    maybeObj.constructor.name.length > 0
  ) {
    return maybeObj.constructor.name
  }
  return 'unknown object'
}
