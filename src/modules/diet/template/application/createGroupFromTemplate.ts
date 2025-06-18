import {
  createRecipedItemGroup,
  createSimpleItemGroup,
  type ItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { scaleRecipeByPreparedQuantity } from '~/modules/diet/recipe/domain/recipeOperations'
import {
  isTemplateRecipe,
  type Template,
} from '~/modules/diet/template/domain/template'
import {
  isTemplateItemFood,
  isTemplateItemRecipe,
  type TemplateItem,
} from '~/modules/diet/template-item/domain/templateItem'

/**
 * Creates an ItemGroup from a Template and TemplateItem, returning group, operation and templateType.
 * For recipes, this properly scales the recipe items based on the user's desired quantity and
 * the recipe's prepared multiplier.
 *
 * @param template - The Template (food or recipe)
 * @param item - The TemplateItem (Item or RecipeItem) containing user's desired quantity
 * @returns Object with newGroup, operation, templateType
 */
export function createGroupFromTemplate(
  template: Template,
  item: TemplateItem,
): { newGroup: ItemGroup; operation: string; templateType: string } {
  if (isTemplateItemFood(item)) {
    return {
      newGroup: createSimpleItemGroup({
        name: item.name,
        items: [item],
      }),
      operation: 'addSimpleItem',
      templateType: 'Item',
    }
  }

  if (isTemplateRecipe(template) && isTemplateItemRecipe(item)) {
    // Scale the recipe items based on the user's desired quantity
    const { scaledItems } = scaleRecipeByPreparedQuantity(
      template,
      item.quantity,
    )

    return {
      newGroup: createRecipedItemGroup({
        name: item.name,
        recipe: template.id,
        items: scaledItems,
      }),
      operation: 'addRecipeItem',
      templateType: 'Recipe',
    }
  }

  throw new Error('Template is not a Recipe or item type mismatch')
}
