import {
  createRecipedItemGroup,
  createSimpleItemGroup,
  type ItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import {
  isTemplateRecipe,
  type Template,
} from '~/modules/diet/template/domain/template'
import {
  isTemplateItemFood,
  type TemplateItem,
} from '~/modules/diet/template-item/domain/templateItem'

/**
 * Creates an ItemGroup from a Template and TemplateItem, returning group, operation and templateType.
 * @param template - The Template (food or recipe)
 * @param item - The TemplateItem (Item or RecipeItem)
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

  if (isTemplateRecipe(template)) {
    return {
      newGroup: createRecipedItemGroup({
        name: item.name,
        recipe: template.id,
        items: [...template.items],
      }),
      operation: 'addRecipeItem',
      templateType: 'Recipe',
    }
  }

  throw new Error('Template is not a Recipe')
}
