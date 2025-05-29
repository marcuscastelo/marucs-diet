import {
  type ItemGroup,
  type RecipedItemGroup,
  createSimpleItemGroup,
  createRecipedItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { generateId } from '~/legacy/utils/idUtils'

export type GroupConvertible =
  | ItemGroup
  | ItemGroup[]
  | { groups: ItemGroup[] }
  | Item
  | Recipe

// TODO: Move isRecipedGroupUpToDate to somewhere else
export function isRecipedGroupUpToDate(
  group: RecipedItemGroup,
  groupRecipe: Recipe,
) {
  if (groupRecipe.id !== group.recipe) {
    console.error(
      'Invalid state! This is a bug! Group recipe is not the same as the recipe in the group!',
    )
    throw new Error('Invalid state! This is a bug! see console.error')
  }

  const groupRecipeItems = groupRecipe.items
  const groupItems = group.items

  if (groupRecipeItems.length !== groupItems.length) {
    return false
  }

  for (let i = 0; i < groupRecipeItems.length; i++) {
    const recipeItem = groupRecipeItems[i]
    const groupItem = groupItems[i]

    if (recipeItem.reference !== groupItem.reference) {
      return false
    }

    if (recipeItem.quantity !== groupItem.quantity) {
      return false
    }

    // TODO: Compare item macros too
  }

  return true
}

function calculateGroupQuantity(groupItems: ItemGroup['items']): number {
  return groupItems
    .map((item) => item.quantity)
    .reduce((acc: number, quantity) => acc + quantity, 0)
}

// TODO: Replace quantity field with a getter that calculates it
export function convertToGroups(convertible: GroupConvertible): ItemGroup[] {
  if (Array.isArray(convertible)) {
    return { ...convertible }
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
        quantity: convertible.quantity,
      }),
    ]
  }

  if ('items' in convertible) {
    return [{ ...convertible }]
  }

  convertible satisfies never
  console.error('Invalid state! This is a bug! Unhandled convertible type!')
  throw new Error('Invalid state! This is a bug! see console.error')
}
