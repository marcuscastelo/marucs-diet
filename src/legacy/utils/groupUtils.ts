import {
  type ItemGroup,
  type RecipedItemGroup,
  createSimpleItemGroup,
  createRecipedItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { handleValidationError } from '~/shared/error/errorHandler'

export type GroupConvertible =
  | ItemGroup
  | ItemGroup[]
  | { groups: ItemGroup[] }
  | Item
  | Recipe

/**
 * Converts various group-like objects into an array of ItemGroups.
 * Throws a clear error if the input type is not handled.
 */
export function convertToGroups(convertible: GroupConvertible): ItemGroup[] {
  if (Array.isArray(convertible)) {
    return [ ...convertible ]
  }

  if ('__type' in convertible && convertible.__type === 'Recipe') {
    return [
      createRecipedItemGroup({
        name: convertible.name,
        items: [...convertible.items],
        recipe: convertible.id,
      }),
    ]
  }

  if ('groups' in convertible) {
    return [...convertible.groups]
  }

  if ('reference' in convertible) {
    return [
      createSimpleItemGroup({
        name: convertible.name,
        items: [{ ...convertible } satisfies Item],
      }),
    ]
  }

  if ('items' in convertible) {
    return [{ ...convertible }]
  }

  // Improved exhaustive check: throw with explicit type info
  const typeName = (convertible && (convertible as any).__type) || typeof convertible
  handleValidationError('Invalid state! Unhandled convertible type in convertToGroups!', {
    component: 'groupUtils',
    operation: 'convertToGroups',
    additionalData: { convertible, typeName }
  })
  throw new Error(`Invalid state! Unhandled convertible type: ${typeName}`)
}
