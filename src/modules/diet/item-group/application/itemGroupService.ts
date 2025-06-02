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
 * Service for handling ItemGroup conversions and operations.
 * This belongs in the application layer, not domain.
 */
export class ItemGroupService {
  /**
   * Converts various group-like objects into an array of ItemGroups.
   * Uses proper type checking instead of string-based detection.
   */
  static convertToGroups(convertible: GroupConvertible): ItemGroup[] {
    if (Array.isArray(convertible)) {
      return [...convertible]
    }

    // Better type checking for Recipe
    if (this.isRecipe(convertible)) {
      return [
        createRecipedItemGroup({
          name: convertible.name,
          items: [...convertible.items],
          recipe: convertible.id,
        }),
      ]
    }

    // Type guard for object with groups
    if (this.hasGroups(convertible)) {
      return [...convertible.groups]
    }

    // Type guard for Item
    if (this.isItem(convertible)) {
      return [
        createSimpleItemGroup({
          name: convertible.name,
          items: [{ ...convertible }],
        }),
      ]
    }

    // Type guard for ItemGroup
    if (this.isItemGroup(convertible)) {
      return [{ ...convertible }]
    }

    // Exhaustive check with better error information
    throw new Error(
      `Unsupported convertible type: ${this.getTypeDescription(convertible)}`
    )
  }

  private static isRecipe(obj: any): obj is Recipe {
    return obj && typeof obj === 'object' && obj.__type === 'Recipe'
  }

  private static hasGroups(obj: any): obj is { groups: ItemGroup[] } {
    return obj && typeof obj === 'object' && Array.isArray(obj.groups)
  }

  private static isItem(obj: any): obj is Item {
    return obj && typeof obj === 'object' && 'reference' in obj
  }

  private static isItemGroup(obj: any): obj is ItemGroup {
    return obj && typeof obj === 'object' && 'items' in obj && !('groups' in obj)
  }

  private static getTypeDescription(obj: any): string {
    if (obj === null) return 'null'
    if (obj === undefined) return 'undefined'
    if (typeof obj !== 'object') return typeof obj
    
    const constructor = obj.constructor?.name
    const type = obj.__type
    
    return type || constructor || 'unknown object'
  }
}
