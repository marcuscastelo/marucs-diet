import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { type RecipeItem } from '~/modules/diet/recipe-item/domain/recipeItem'
import {
  isTemplateFood,
  type Template,
} from '~/modules/diet/template/domain/template'
import { generateId } from '~/shared/utils/idUtils'
import { calcRecipeMacros } from '~/shared/utils/macroMath'

const DEFAULT_QUANTITY = 100

/**
 * Converts a Template (FoodTemplate or RecipeTemplate) to an Item or RecipeItem for use in item groups.
 * @param template - The Template to convert
 * @returns The corresponding Item or RecipeItem
 */
export function templateToItem(template: Template): Item | RecipeItem {
  if (isTemplateFood(template)) {
    return {
      id: generateId(),
      reference: template.id,
      name: template.name,
      macros: template.macros,
      __type: 'Item',
      quantity: DEFAULT_QUANTITY, // Default quantity for food items
    } satisfies Item
  }
  return {
    id: generateId(),
    reference: template.id,
    name: template.name,
    macros: calcRecipeMacros(template as Recipe),
    __type: 'RecipeItem',
    quantity: DEFAULT_QUANTITY, // Default quantity for recipe items
  } satisfies RecipeItem
}
