import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { handleValidationError } from '~/shared/error/errorHandler'

export type MacroOverflowOptions = {
  enable: boolean
  originalItem?: TemplateItem
}

export type MacroOverflowContext = {
  currentDayDiet: DayDiet | null
  macroTarget: MacroNutrients | null
  macroOverflowOptions: MacroOverflowOptions
}

export function isOverflow(
  item: TemplateItem,
  property: keyof MacroNutrients,
  context: MacroOverflowContext,
): boolean {
  const { currentDayDiet, macroTarget, macroOverflowOptions } = context
  if (!macroOverflowOptions.enable) {
    return false
  }
  if (currentDayDiet === null) {
    handleValidationError(
      'currentDayDiet is undefined, cannot calculate overflow',
      {
        component: 'macroOverflow',
        operation: 'isOverflow',
        additionalData: { property, itemName: item.name },
      },
    )
    return false
  }
  if (macroTarget === null) {
    handleValidationError(
      'macroTarget is undefined, cannot calculate overflow',
      {
        component: 'macroOverflow',
        operation: 'isOverflow',
        additionalData: { property, itemName: item.name },
      },
    )
    return false
  }
  // TODO: Implement overflow logic here
  return false
}
