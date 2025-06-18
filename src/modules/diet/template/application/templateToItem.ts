import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { getRecipePreparedQuantity } from '~/modules/diet/recipe/domain/recipeOperations'
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
 * For recipes, this creates a RecipeItem that represents the desired portion of the recipe.
 * The macros are calculated based on the scaled recipe content.
 *
 * @param template - The Template to convert
 * @param desiredQuantity - The desired quantity in grams (defaults to 100g)
 * @returns The corresponding Item or RecipeItem
 */
export function templateToItem(
  template: Template,
  desiredQuantity: number = DEFAULT_QUANTITY,
): Item | RecipeItem {
  if (isTemplateFood(template)) {
    return {
      id: generateId(),
      reference: template.id,
      name: template.name,
      macros: template.macros,
      __type: 'Item',
      quantity: desiredQuantity,
    } satisfies Item
  }

  // For recipes, we need to calculate macros based on the desired portion
  const recipe = template as Recipe
  const recipePreparedQuantity = getRecipePreparedQuantity(recipe)

  // Calculate macros for the desired quantity
  let macros: RecipeItem['macros']
  if (recipePreparedQuantity > 0) {
    // Scale the recipe to get the correct macro values for the desired quantity
    const scalingFactor = desiredQuantity / recipePreparedQuantity
    const recipeMacros = calcRecipeMacros(recipe)
    macros = {
      protein: recipeMacros.protein * scalingFactor,
      carbs: recipeMacros.carbs * scalingFactor,
      fat: recipeMacros.fat * scalingFactor,
    }
  } else {
    // Fallback for recipes with zero prepared quantity
    macros = { protein: 0, carbs: 0, fat: 0 }
  }

  return {
    id: generateId(),
    reference: template.id,
    name: template.name,
    macros,
    __type: 'RecipeItem',
    quantity: desiredQuantity,
  } satisfies RecipeItem
}
