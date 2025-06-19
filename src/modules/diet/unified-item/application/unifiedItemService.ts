import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import {
  isFood,
  isGroup,
  isRecipe,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { calcUnifiedItemMacros } from '~/shared/utils/macroMath'

/**
 * Application services for UnifiedItem operations
 */

/**
 * Calculates total macros for an array of UnifiedItems
 */
export function calculateTotalMacros(items: UnifiedItem[]): MacroNutrients {
  return items.reduce(
    (total, item) => {
      const itemMacros = calcUnifiedItemMacros(item)
      return {
        carbs: total.carbs + itemMacros.carbs,
        protein: total.protein + itemMacros.protein,
        fat: total.fat + itemMacros.fat,
      }
    },
    { carbs: 0, protein: 0, fat: 0 },
  )
}

/**
 * Filters UnifiedItems by type
 */
export function filterItemsByType(
  items: UnifiedItem[],
  type: 'food' | 'recipe' | 'group',
): UnifiedItem[] {
  switch (type) {
    case 'food':
      return items.filter(isFood)
    case 'recipe':
      return items.filter(isRecipe)
    case 'group':
      return items.filter(isGroup)
    default:
      return []
  }
}

/**
 * Scales a UnifiedItem's quantity and recalculates macros proportionally
 */
export function scaleUnifiedItem(
  item: UnifiedItem,
  scaleFactor: number,
): UnifiedItem {
  if (isFood(item)) {
    // For food items, we only scale the quantity
    // The stored macros remain as per 100g
    return {
      ...item,
      quantity: item.quantity * scaleFactor,
    }
  } else {
    // For recipes and groups, only scale quantity
    // Macros will be calculated from children
    return {
      ...item,
      quantity: item.quantity * scaleFactor,
    }
  }
}

/**
 * Updates a UnifiedItem in an array by ID
 */
export function updateUnifiedItemInArray(
  items: UnifiedItem[],
  itemId: UnifiedItem['id'],
  updates: Partial<Pick<UnifiedItem, 'name' | 'quantity'>> & {
    macros?: { carbs: number; protein: number; fat: number }
  },
): UnifiedItem[] {
  return items.map((item) => {
    if (item.id === itemId) {
      const updatedItem = { ...item, ...updates }
      // Only apply macros updates to food items
      if (updates.macros && isFood(item)) {
        return { ...updatedItem, macros: updates.macros }
      }
      return updatedItem
    }
    return item
  })
}

/**
 * Removes a UnifiedItem from an array by ID
 */
export function removeUnifiedItemFromArray(
  items: UnifiedItem[],
  itemId: UnifiedItem['id'],
): UnifiedItem[] {
  return items.filter((item) => item.id !== itemId)
}

/**
 * Finds a UnifiedItem in an array by ID
 */
export function findUnifiedItemById(
  items: UnifiedItem[],
  itemId: UnifiedItem['id'],
): UnifiedItem | undefined {
  return items.find((item) => item.id === itemId)
}

/**
 * Sorts UnifiedItems by a specific property
 */
export function sortUnifiedItems(
  items: UnifiedItem[],
  sortBy: 'name' | 'quantity' | 'carbs' | 'protein' | 'fat',
  direction: 'asc' | 'desc' = 'asc',
): UnifiedItem[] {
  const sorted = [...items].sort((a, b) => {
    let aValue: number | string
    let bValue: number | string

    switch (sortBy) {
      case 'name':
        aValue = a.name
        bValue = b.name
        break
      case 'quantity':
        aValue = a.quantity
        bValue = b.quantity
        break
      case 'carbs':
        aValue = calcUnifiedItemMacros(a).carbs
        bValue = calcUnifiedItemMacros(b).carbs
        break
      case 'protein':
        aValue = calcUnifiedItemMacros(a).protein
        bValue = calcUnifiedItemMacros(b).protein
        break
      case 'fat':
        aValue = calcUnifiedItemMacros(a).fat
        bValue = calcUnifiedItemMacros(b).fat
        break
      default:
        return 0
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  return sorted
}

/**
 * Groups UnifiedItems by their reference type
 */
export function groupUnifiedItemsByType(items: UnifiedItem[]): {
  foods: UnifiedItem[]
  recipes: UnifiedItem[]
  groups: UnifiedItem[]
} {
  return {
    foods: filterItemsByType(items, 'food'),
    recipes: filterItemsByType(items, 'recipe'),
    groups: filterItemsByType(items, 'group'),
  }
}
