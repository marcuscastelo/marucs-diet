import { ItemGroup } from '@/modules/diet/item-group/domain/itemGroup'
import { Meal } from '@/modules/diet/meal/domain/meal'

// TODO: Create RecipeEditor, MealEditor, ItemGroupEditor, FoodItemEditor classes to avoid this code duplication and error proneness
/**
 * @deprecated
 */
export function editInnerGroup(meal: Meal, innerGroup: ItemGroup) {
  const newMeal = { ...meal }

  const index = newMeal.groups.findIndex((group) => group.id === innerGroup.id)

  if (index === -1) {
    console.error('Invalid state! This is a bug! Group not found in meal!')
    throw new Error('Invalid state! This is a bug! see console.error')
  }

  newMeal.groups[index] = { ...innerGroup }

  return newMeal
}
/**
 * @deprecated
 */
export function deleteInnerGroup(meal: Meal, groupId: ItemGroup['id']) {
  const newMeal = { ...meal }

  const index = newMeal.groups.findIndex((group) => group.id === groupId)

  if (index === -1) {
    console.error('Invalid state! This is a bug! Group not found in meal!')
    throw new Error('Invalid state! This is a bug! see console.error')
  }

  newMeal.groups.splice(index, 1)

  return newMeal
}
/**
 * @deprecated
 */
export function addInnerGroup(meal: Meal, innerGroup: ItemGroup) {
  const newMeal = { ...meal }

  // Check if same ID already exists
  const index = newMeal.groups.findIndex((group) => group.id === innerGroup.id)

  // If already exists, warn and return
  if (index !== -1) {
    console.warn(
      'Invalid state! This is a bug! Group already exists in meal! Not adding!',
    )

    return newMeal
  }

  // If not exists, add
  newMeal.groups.push(innerGroup)

  return newMeal
}

/**
 * @deprecated
 */
export function addInnerGroups(meal: Meal, innerGroups: readonly ItemGroup[]) {
  let newMeal = { ...meal }

  innerGroups.forEach((innerGroup) => {
    newMeal = addInnerGroup(newMeal, innerGroup)
  })

  return newMeal
}
