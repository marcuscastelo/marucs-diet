import {
  createRecipedItemGroup,
  createSimpleItemGroup,
  type ItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  isTemplateItemFood,
  type TemplateItem,
} from '~/modules/diet/template-item/domain/templateItem'
import { type Template } from '~/modules/diet/template/domain/template'

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
  return {
    newGroup: createRecipedItemGroup({
      name: item.name,
      recipe: (template as Recipe).id,
      items: [...(template as Recipe).items],
    }),
    operation: 'addRecipeItem',
    templateType: 'Recipe',
  }
}
