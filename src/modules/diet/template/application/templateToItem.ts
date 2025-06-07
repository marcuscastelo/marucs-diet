import { calcRecipeMacros } from '~/legacy/utils/macroMath'
import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { type RecipeItem } from '~/modules/diet/recipe-item/domain/recipeItem'
import {
  type Template,
  isTemplateFood,
} from '~/modules/diet/template/domain/template'

/**
 * Converts a Template (FoodTemplate or RecipeTemplate) to an Item or RecipeItem for use in item groups.
 * @param template - The Template to convert
 * @returns The corresponding Item or RecipeItem
 */
export function templateToItem(template: Template): Item | RecipeItem {
  if (isTemplateFood(template)) {
    return {
      reference: template.id,
      name: template.name,
      macros: template.macros,
      __type: 'Item',
    } as Item
  }
  return {
    reference: template.id,
    name: template.name,
    macros: calcRecipeMacros(template as Recipe),
    __type: 'RecipeItem',
  } as RecipeItem
}
