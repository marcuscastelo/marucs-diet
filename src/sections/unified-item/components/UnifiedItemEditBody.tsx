import { type Accessor, type Setter, Show } from 'solid-js'

import { currentDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import {
  isFood,
  isGroup,
  isRecipe,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import { type MacroValues } from '~/sections/common/components/MaxQuantityButton'
import { useClipboard } from '~/sections/common/hooks/useClipboard'
import { type UseFieldReturn } from '~/sections/common/hooks/useField'
import { ItemFavorite } from '~/sections/food-item/components/ItemView'
import { GroupChildrenEditor } from '~/sections/unified-item/components/GroupChildrenEditor'
import { QuantityControls } from '~/sections/unified-item/components/QuantityControls'
import { QuantityShortcuts } from '~/sections/unified-item/components/QuantityShortcuts'
import {
  UnifiedItemName,
  UnifiedItemView,
  UnifiedItemViewNutritionalInfo,
} from '~/sections/unified-item/components/UnifiedItemView'
import { createDebug } from '~/shared/utils/createDebug'
import { calcDayMacros, calcUnifiedItemMacros } from '~/shared/utils/macroMath'

const debug = createDebug()

export type UnifiedItemEditBodyProps = {
  canApply: boolean
  item: Accessor<UnifiedItem>
  setItem: Setter<UnifiedItem>
  macroOverflow: () => {
    enable: boolean
    originalItem?: UnifiedItem | undefined
  }
  quantityField: UseFieldReturn<number>
  onEditChild?: (child: UnifiedItem) => void
  recipeViewMode?: 'recipe' | 'group'
}

export function UnifiedItemEditBody(props: UnifiedItemEditBodyProps) {
  debug('[UnifiedItemEditBody] called', props)

  const clipboard = useClipboard()

  // Cálculo do restante disponível de macros
  function getAvailableMacros(): MacroValues {
    debug('[UnifiedItemEditBody] getAvailableMacros')
    const dayDiet = currentDayDiet()
    const macroTarget = dayDiet
      ? getMacroTargetForDay(new Date(dayDiet.target_day))
      : null
    const originalItem = props.macroOverflow().originalItem
    if (!dayDiet || !macroTarget) {
      return { carbs: 0, protein: 0, fat: 0 }
    }
    const dayMacros = calcDayMacros(dayDiet)
    const originalMacros = originalItem
      ? calcUnifiedItemMacros(originalItem)
      : { carbs: 0, protein: 0, fat: 0 }
    return {
      carbs: macroTarget.carbs - dayMacros.carbs + originalMacros.carbs,
      protein: macroTarget.protein - dayMacros.protein + originalMacros.protein,
      fat: macroTarget.fat - dayMacros.fat + originalMacros.fat,
    }
  }

  const handleQuantitySelect = (quantity: number) => {
    debug('[UnifiedItemEditBody] shortcut quantity', quantity)
    props.quantityField.setRawValue(quantity.toString())
  }

  return (
    <>
      {/* Para alimentos e receitas (modo normal): controles de quantidade normal */}
      <Show
        when={
          isFood(props.item()) ||
          (isRecipe(props.item()) && props.recipeViewMode !== 'group')
        }
      >
        <QuantityShortcuts onQuantitySelect={handleQuantitySelect} />

        <QuantityControls
          item={props.item}
          setItem={props.setItem}
          canApply={props.canApply}
          getAvailableMacros={getAvailableMacros}
          quantityField={props.quantityField}
        />
      </Show>

      {/* Para grupos ou receitas em modo grupo: editor de filhos */}
      <Show
        when={
          isGroup(props.item()) ||
          (isRecipe(props.item()) && props.recipeViewMode === 'group')
        }
      >
        <GroupChildrenEditor
          item={props.item}
          setItem={props.setItem}
          onEditChild={props.onEditChild}
        />
      </Show>

      <Show
        when={
          isFood(props.item()) ||
          isRecipe(props.item()) ||
          isGroup(props.item())
        }
      >
        <UnifiedItemView
          mode="edit"
          handlers={{
            onCopy: () => {
              clipboard.write(JSON.stringify(props.item()))
            },
          }}
          item={props.item}
          class="mt-4"
          header={() => (
            <HeaderWithActions
              name={<UnifiedItemName item={props.item} />}
              primaryActions={
                <Show when={isFood(props.item())}>
                  <ItemFavorite
                    foodId={
                      (
                        props.item() as Extract<
                          UnifiedItem,
                          { reference: { id: number } }
                        >
                      ).reference.id
                    }
                  />
                </Show>
              }
            />
          )}
          nutritionalInfo={() => (
            <UnifiedItemViewNutritionalInfo item={props.item} />
          )}
        />
      </Show>
    </>
  )
}
