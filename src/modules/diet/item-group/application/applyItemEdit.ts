import { currentDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { updateItemGroup } from '~/modules/diet/item-group/application/itemGroup'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'

/**
 * Updates a TemplateItem in the correct group of the current day diet.
 * @param edited - The edited TemplateItem
 */
export async function applyItemEdit(edited: TemplateItem): Promise<void> {
  const dayDiet = currentDayDiet()
  if (!dayDiet) return
  for (const meal of dayDiet.meals) {
    for (const group of meal.groups) {
      const idx = group.items.findIndex((i) => i.id === edited.id)
      if (idx !== -1) {
        const updatedItems = group.items.map((i) =>
          i.id === edited.id && i.__type === edited.__type ? edited : i,
        )
        await updateItemGroup(dayDiet.id, meal.id, group.id, {
          ...group,
          items: updatedItems,
        })
        return
      }
    }
  }
}
