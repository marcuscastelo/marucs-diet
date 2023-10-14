import { ItemGroup, RecipedItemGroup } from '@/model/itemGroupModel'
import { FoodItem } from '@/model/foodItemModel'
import { Recipe } from '@/model/recipeModel'
import { generateId } from '@/utils/idUtils'

export type GroupConvertible =
  | ItemGroup
  | ItemGroup[]
  | { groups: ItemGroup[] }
  | FoodItem
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

export function calculateGroupQuantity(groupItems: ItemGroup['items']) {
  return groupItems.reduce((acc, item) => acc + item.quantity, 0)
}

// TODO: Replace quantity field with a getter that calculates it
/**
 * @deprecated
 */
export function updateTotalQuantity(group: ItemGroup) {
  const newGroup = { ...group }

  newGroup.quantity = newGroup.items.reduce(
    (acc, item) => acc + item.quantity,
    0,
  )

  return newGroup
}

/**
 * @deprecated Use ItemGroupEditor instead
 */
export function editInnerItem(group: ItemGroup, innerItem: FoodItem) {
  const newGroup = { ...group }

  const index = newGroup.items.findIndex((item) => item.id === innerItem.id)

  if (index === -1) {
    console.error('Invalid state! This is a bug! Item not found in group!')
    throw new Error('Invalid state! This is a bug! see console.error')
  }

  newGroup.items[index] = { ...innerItem }

  return updateTotalQuantity(newGroup)
}

/**
 * @deprecated Use ItemGroupEditor instead
 */
export function deleteInnerItem(group: ItemGroup, itemId: FoodItem['id']) {
  const newGroup = { ...group }

  const index = newGroup.items.findIndex((item) => item.id === itemId)

  if (index === -1) {
    console.error('Invalid state! This is a bug! Item not found in group!')
    throw new Error('Invalid state! This is a bug! see console.error')
  }

  newGroup.items.splice(index, 1)

  return updateTotalQuantity(newGroup)
}

/**
 * @deprecated Use ItemGroupEditor instead
 */
export function addInnerItem(group: ItemGroup, innerItem: FoodItem) {
  const newGroup = { ...group }

  // Check if same ID already exists
  const index = newGroup.items.findIndex((item) => item.id === innerItem.id)

  // If already exists, warn and return
  if (index !== -1) {
    console.warn(
      'Invalid state! This is a bug! Item already exists in group! Not adding!',
    )

    return updateTotalQuantity(newGroup)
  }

  // If not exists, add
  newGroup.items.push(innerItem)

  return updateTotalQuantity(newGroup)
}

/**
 * @deprecated Use ItemGroupEditor instead
 */
export function addInnerItems(group: ItemGroup, innerItem: FoodItem[]) {
  let newGroup = { ...group }

  innerItem.forEach((item) => {
    newGroup = addInnerItem(newGroup, item)
  })

  return newGroup
}

export function convertToGroups(convertible: GroupConvertible): ItemGroup[] {
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
        recipe: convertible.id,
      },
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
        type: 'simple',
      } satisfies ItemGroup,
    ]
  }

  if ('items' in convertible) {
    return [{ ...convertible }]
  }

  convertible satisfies never
  console.error('Invalid state! This is a bug! Unhandled convertible type!')
  throw new Error('Invalid state! This is a bug! see console.error')
}
