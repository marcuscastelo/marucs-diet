import {
  type Accessor,
  createEffect,
  createSignal,
  For,
  mergeProps,
  type Setter,
  Show,
  untrack,
} from 'solid-js'

import { currentDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import {
  isFood,
  isRecipe,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import {
  MacroValues,
  MaxQuantityButton,
} from '~/sections/common/components/MaxQuantityButton'
import { Modal } from '~/sections/common/components/Modal'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { useClipboard } from '~/sections/common/hooks/useClipboard'
import { useFloatField } from '~/sections/common/hooks/useField'
import { ItemFavorite } from '~/sections/food-item/components/ItemView'
import {
  UnifiedItemName,
  UnifiedItemView,
  UnifiedItemViewNutritionalInfo,
} from '~/sections/unified-item/components/UnifiedItemView'
import { createDebug } from '~/shared/utils/createDebug'
import { calcDayMacros, calcUnifiedItemMacros } from '~/shared/utils/macroMath'

const debug = createDebug()

export type UnifiedItemEditModalProps = {
  targetMealName: string
  targetNameColor?: string
  item: Accessor<UnifiedItem>
  macroOverflow: () => {
    enable: boolean
    originalItem?: UnifiedItem | undefined
  }
  onApply: (item: UnifiedItem) => void
  onCancel?: () => void
}

export const UnifiedItemEditModal = (_props: UnifiedItemEditModalProps) => {
  debug('[UnifiedItemEditModal] called', _props)
  const props = mergeProps({ targetNameColor: 'text-green-500' }, _props)
  const { setVisible } = useModalContext()

  const [item, setItem] = createSignal(untrack(() => props.item()))
  createEffect(() => setItem(props.item()))

  const canApply = () => {
    debug('[UnifiedItemEditModal] canApply', item().quantity)
    return item().quantity > 0
  }

  return (
    <Modal class="border-2 border-white">
      <Modal.Header
        title={
          <span>
            Editando item em
            <span class={props.targetNameColor}>"{props.targetMealName}"</span>
          </span>
        }
      />
      <Modal.Content>
        <Show when={isFood(item()) || isRecipe(item())}>
          <Body
            canApply={canApply()}
            item={item}
            setItem={setItem}
            macroOverflow={props.macroOverflow}
          />
        </Show>
        <Show when={!isFood(item()) && !isRecipe(item())}>
          <div class="text-gray-400 text-sm">
            Este tipo de item não é suportado ainda. Apenas itens de comida e
            receitas podem ser editados.
          </div>
        </Show>
      </Modal.Content>
      <Modal.Footer>
        <button
          class="btn cursor-pointer uppercase"
          onClick={(e) => {
            debug('[UnifiedItemEditModal] Cancel clicked')
            e.preventDefault()
            e.stopPropagation()
            setVisible(false)
            props.onCancel?.()
          }}
        >
          Cancelar
        </button>
        <button
          class="btn cursor-pointer uppercase"
          disabled={!canApply() || (!isFood(item()) && !isRecipe(item()))}
          onClick={(e) => {
            debug('[UnifiedItemEditModal] Apply clicked', item())
            e.preventDefault()
            console.debug(
              '[UnifiedItemEditModal] onApply - calling onApply with item.value=',
              item(),
            )
            props.onApply(item())
            setVisible(false)
          }}
        >
          Aplicar
        </button>
      </Modal.Footer>
    </Modal>
  )
}

function Body(props: {
  canApply: boolean
  item: Accessor<UnifiedItem>
  setItem: Setter<UnifiedItem>
  macroOverflow: () => {
    enable: boolean
    originalItem?: UnifiedItem | undefined
  }
}) {
  debug('[Body] called', props)

  const quantitySignal = () =>
    props.item().quantity === 0 ? undefined : props.item().quantity

  const clipboard = useClipboard()
  const quantityField = useFloatField(quantitySignal, {
    decimalPlaces: 0,
    // eslint-disable-next-line solid/reactivity
    defaultValue: props.item().quantity,
  })

  createEffect(() => {
    debug('[Body] createEffect setItem', quantityField.value())
    props.setItem({
      ...untrack(props.item),
      quantity: quantityField.value() ?? 0,
    })
  })

  const [currentHoldTimeout, setCurrentHoldTimeout] =
    createSignal<NodeJS.Timeout | null>(null)
  const [currentHoldInterval, setCurrentHoldInterval] =
    createSignal<NodeJS.Timeout | null>(null)

  const increment = () => {
    debug('[Body] increment')
    quantityField.setRawValue(((quantityField.value() ?? 0) + 1).toString())
  }
  const decrement = () => {
    debug('[Body] decrement')
    quantityField.setRawValue(
      Math.max(0, (quantityField.value() ?? 0) - 1).toString(),
    )
  }

  const holdRepeatStart = (action: () => void) => {
    debug('[Body] holdRepeatStart')
    setCurrentHoldTimeout(
      setTimeout(() => {
        setCurrentHoldInterval(
          setInterval(() => {
            action()
          }, 100),
        )
      }, 500),
    )
  }

  const holdRepeatStop = () => {
    debug('[Body] holdRepeatStop')
    const currentHoldTimeout_ = currentHoldTimeout()
    const currentHoldInterval_ = currentHoldInterval()

    if (currentHoldTimeout_ !== null) {
      clearTimeout(currentHoldTimeout_)
    }

    if (currentHoldInterval_ !== null) {
      clearInterval(currentHoldInterval_)
    }
  }

  // Cálculo do restante disponível de macros
  function getAvailableMacros(): MacroValues {
    debug('[Body] getAvailableMacros')
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

  return (
    <>
      <p class="mt-1 text-gray-400">Atalhos</p>
      <For
        each={[
          [10, 20, 30, 40, 50],
          [100, 150, 200, 250, 300],
        ]}
      >
        {(row) => (
          <div class="mt-1 flex w-full gap-1">
            <For each={row}>
              {(value) => (
                <div
                  class="btn-primary btn-sm btn cursor-pointer uppercase flex-1"
                  onClick={() => {
                    debug('[Body] shortcut quantity', value)
                    quantityField.setRawValue(value.toString())
                  }}
                >
                  {value}g
                </div>
              )}
            </For>
          </div>
        )}
      </For>
      <div class="mt-3 flex w-full justify-between gap-1">
        <div
          class="my-1 flex flex-1 justify-around"
          style={{ position: 'relative' }}
        >
          <FloatInput
            field={quantityField}
            style={{ width: '100%' }}
            onFieldCommit={(value) => {
              debug('[Body] FloatInput onFieldCommit', value)
              if (value === undefined) {
                quantityField.setRawValue(props.item().quantity.toString())
              }
            }}
            tabIndex={-1}
            onFocus={(event) => {
              debug('[Body] FloatInput onFocus')
              event.target.select()
              if (quantityField.value() === 0) {
                quantityField.setRawValue('')
              }
            }}
            type="number"
            placeholder="Quantidade (gramas)"
            class={`input-bordered  input mt-1  border-gray-300 bg-gray-800 ${
              !props.canApply ? 'input-error border-red-500' : ''
            }`}
          />
          <Show when={isFood(props.item()) || isRecipe(props.item())}>
            <MaxQuantityButton
              currentValue={quantityField.value() ?? 0}
              macroTargets={getAvailableMacros()}
              itemMacros={(() => {
                if (isFood(props.item())) {
                  return (
                    props.item() as Extract<
                      UnifiedItem,
                      { reference: { type: 'food'; macros: MacroNutrients } }
                    >
                  ).reference.macros
                }
                if (isRecipe(props.item())) {
                  // For recipes, calculate macros from children (per 100g of prepared recipe)
                  const recipeMacros = calcUnifiedItemMacros(props.item())
                  const recipeQuantity = props.item().quantity || 1
                  // Convert to per-100g basis for the button
                  return {
                    carbs: (recipeMacros.carbs * 100) / recipeQuantity,
                    protein: (recipeMacros.protein * 100) / recipeQuantity,
                    fat: (recipeMacros.fat * 100) / recipeQuantity,
                  }
                }
                return { carbs: 0, protein: 0, fat: 0 }
              })()}
              onMaxSelected={(maxValue: number) => {
                debug('[Body] MaxQuantityButton onMaxSelected', maxValue)
                quantityField.setRawValue(maxValue.toFixed(2))
              }}
              disabled={!props.canApply}
            />
          </Show>
        </div>
        <div class="my-1 ml-1 flex shrink justify-around gap-1">
          <div
            class="btn-primary btn-xs btn cursor-pointer uppercase h-full w-10 px-6 text-4xl text-red-600"
            onClick={decrement}
            onMouseDown={() => {
              debug('[Body] decrement mouse down')
              holdRepeatStart(decrement)
            }}
            onMouseUp={holdRepeatStop}
            onTouchStart={() => {
              debug('[Body] decrement touch start')
              holdRepeatStart(decrement)
            }}
            onTouchEnd={holdRepeatStop}
          >
            {' '}
            -{' '}
          </div>
          <div
            class="btn-primary btn-xs btn cursor-pointer uppercase ml-1 h-full w-10 px-6 text-4xl text-green-400"
            onClick={increment}
            onMouseDown={() => {
              debug('[Body] increment mouse down')
              holdRepeatStart(increment)
            }}
            onMouseUp={holdRepeatStop}
            onTouchStart={() => {
              debug('[Body] increment touch start')
              holdRepeatStart(increment)
            }}
            onTouchEnd={holdRepeatStop}
          >
            {' '}
            +{' '}
          </div>
        </div>
      </div>

      <Show when={isFood(props.item()) || isRecipe(props.item())}>
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
