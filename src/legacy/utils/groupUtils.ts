import {
  type ItemGroup,
  type RecipedItemGroup
} from '@/modules/diet/item-group/domain/itemGroup'
import { type FoodItem } from '@/modules/diet/food-item/domain/foodItem'
import { type Recipe } from '@/modules/diet/recipe/domain/recipe'
import { generateId } from '@/legacy/utils/idUtils'

export type GroupConvertible =
  | ItemGroup
  | ItemGroup[]
  | { groups: ItemGroup[] }
  | FoodItem
  | Recipe

// TODO: Move isRecipedGroupUpToDate to somewhere else
export function isRecipedGroupUpToDate (
  group: RecipedItemGroup,
  groupRecipe: Recipe
) {
  if (groupRecipe.id !== group.recipe) {
    console.error(
      'Invalid state! This is a bug! Group recipe is not the same as the recipe in the group!'
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

export function calculateGroupQuantity (groupItems: ItemGroup['items']): number {
  return groupItems
    .map((item) => item.quantity)
    .reduce((acc: number, quantity) => acc + quantity, 0)
}

// TODO: Replace quantity field with a getter that calculates it
/**
 * @deprecated
 */
export function updateTotalQuantity (group: ItemGroup) {
  const newGroup = { ...group }

  newGroup.quantity = newGroup.items
    .map((item) => item.quantity)
    .reduce((acc, quantity) => acc + quantity, 0)

  return newGroup
}

export function convertToGroups (convertible: GroupConvertible): ItemGroup[] {
  if (Array.isArray(convertible)) {
    return { ...convertible }
  }

  if ('__type' in convertible && convertible.__type === 'Recipe') {
    return [
      {
        id: generateId(),
        name: convertible.name,
        items: [...convertible.items],
        quantity: calculateGroupQuantity(convertible.items),
        type: 'recipe',
        recipe: convertible.id
      }
    ]
  }

  if ('groups' in convertible) {
    return [...convertible.groups]
  }

  if ('reference' in convertible) {
    return [
      // TODO: createItemGroup({ items: [container] })
      {
        id: generateId(),
        name: convertible.name,
        items: [{ ...convertible } satisfies FoodItem],
        quantity: convertible.quantity,
        type: 'simple'
      } satisfies ItemGroup
    ]
  }

  if ('items' in convertible) {
    return [{ ...convertible }]
  }

  convertible satisfies never
  console.error('Invalid state! This is a bug! Unhandled convertible type!')
  throw new Error('Invalid state! This is a bug! see console.error')
}
