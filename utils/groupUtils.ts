import { ItemGroup, RecipedItemGroup } from '@/model/foodItemGroupModel'
import { FoodItem } from '@/model/foodItemModel'
import { Recipe } from '@/model/recipeModel'

export type GroupContainer = ItemGroup | ItemGroup[] | { groups: ItemGroup[] }

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

export function editInnerItem(group: ItemGroup, innerItem: FoodItem) {
  const newGroup = { ...group }

  const index = newGroup.items.findIndex((item) => item.id === innerItem.id)

  if (index === -1) {
    console.error('Invalid state! This is a bug! Item not found in group!')
    throw new Error('Invalid state! This is a bug! see console.error')
  }

  newGroup.items[index] = { ...innerItem }

  return newGroup
}

export function deleteInnerItem(group: ItemGroup, itemId: FoodItem['id']) {
  const newGroup = { ...group }

  const index = newGroup.items.findIndex((item) => item.id === itemId)

  if (index === -1) {
    console.error('Invalid state! This is a bug! Item not found in group!')
    throw new Error('Invalid state! This is a bug! see console.error')
  }

  newGroup.items.splice(index, 1)

  return newGroup
}

export function addInnerItem(group: ItemGroup, innerItem: FoodItem) {
  const newGroup = { ...group }

  // Check if same ID already exists
  const index = newGroup.items.findIndex((item) => item.id === innerItem.id)

  // If already exists, warn and return
  if (index !== -1) {
    console.warn(
      'Invalid state! This is a bug! Item already exists in group! Not adding!',
    )

    return newGroup
  }

  // If not exists, add
  newGroup.items.push(innerItem)

  return newGroup
}

export function extractGroups(container: GroupContainer): ItemGroup[] {
  if (Array.isArray(container)) {
    return { ...container }
  }

  if ('groups' in container) {
    return [...container.groups]
  }

  return [{ ...container }]
}
