import { type Accessor, createMemo } from 'solid-js'

import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import MacroNutrientsView from '~/sections/macro-nutrients/components/MacroNutrientsView'
import {
  calcUnifiedItemCalories,
  calcUnifiedItemMacros,
} from '~/shared/utils/macroMath'

export type UnifiedItemNutritionalInfoProps = {
  item: Accessor<UnifiedItem>
}

export function UnifiedItemNutritionalInfo(
  props: UnifiedItemNutritionalInfoProps,
) {
  const calories = createMemo(() => calcUnifiedItemCalories(props.item()))
  const macros = createMemo(() => calcUnifiedItemMacros(props.item()))

  return (
    <div class="flex">
      <MacroNutrientsView macros={macros()} />
      <div class="ml-auto">
        <span class="text-white"> {props.item().quantity}g </span>|
        <span class="text-white"> {calories().toFixed(0)}kcal </span>
      </div>
    </div>
  )
}
