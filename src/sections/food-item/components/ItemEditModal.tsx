import {
  type Accessor,
  createEffect,
  createSignal,
  For,
  mergeProps,
  type Setter,
  untrack,
} from 'solid-js'

import { currentDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { type Item } from '~/modules/diet/item/domain/item'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { showError } from '~/modules/toast/application/toastManager'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import {
  MacroValues,
  MaxQuantityButton,
} from '~/sections/common/components/MaxQuantityButton'
import { Modal } from '~/sections/common/components/Modal'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { useClipboard } from '~/sections/common/hooks/useClipboard'
import { useFloatField } from '~/sections/common/hooks/useField'
import {
  ItemFavorite,
  ItemName,
  ItemNutritionalInfo,
  ItemView,
} from '~/sections/food-item/components/ItemView'
import { createDebug } from '~/shared/utils/createDebug'
import { calcDayMacros, calcItemMacros } from '~/shared/utils/macroMath'

const debug = createDebug()

/**
 * Modal for editing a TemplateItem.
 *
 * @param targetName - Name of the target (meal/group/recipe)
 * @param targetNameColor - Optional color for the target name
 * @param item - Accessor for the TemplateItem being edited
 * @param macroOverflow - Macro overflow context
 * @param onApply - Called when user applies changes
 * @param onCancel - Called when user cancels
 * @param onDelete - Called when user deletes the item
 */
export type ItemEditModalProps = {
  targetName: string
  targetNameColor?: string
  item: Accessor<TemplateItem>
  macroOverflow: () => {
    enable: boolean
    originalItem?: TemplateItem | undefined
  }
  onApply: (item: TemplateItem) => void
  onCancel?: () => void
}

export const ItemEditModal = (_props: ItemEditModalProps) => {
  debug('[ItemEditModal] called', _props)
  const props = mergeProps({ targetNameColor: 'text-green-500' }, _props)
  const { setVisible } = useModalContext()

  const [item, setItem] = createSignal(untrack(() => props.item()))
  createEffect(() => setItem(props.item()))

  const canApply = () => {
    debug('[ItemEditModal] canApply', item().quantity)
    return item().quantity > 0
  }

  return (
    <Modal class="border-2 border-white">
      <Modal.Header
        title={
          <span>
            Editando item em
            <span class={props.targetNameColor}>"{props.targetName}"</span>
          </span>
        }
      />
      <Modal.Content>
        <Body
          canApply={canApply()}
          item={item}
          setItem={setItem}
          macroOverflow={props.macroOverflow}
        />
      </Modal.Content>
      <Modal.Footer>
        <button
          class="btn cursor-pointer uppercase"
          onClick={(e) => {
            debug('[ItemEditModal] Cancel clicked')
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
          disabled={!canApply()}
          onClick={(e) => {
            debug('[ItemEditModal] Apply clicked', item())
            e.preventDefault()
            console.debug(
              '[ItemEditModal] onApply - calling onApply with item.value=',
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
  item: Accessor<TemplateItem>
  setItem: Setter<TemplateItem>
  macroOverflow: () => {
    enable: boolean
    originalItem?: TemplateItem | undefined
  }
}) {
  debug('[Body] called', props)
  const id = () => props.item().id

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
      ? calcItemMacros(originalItem)
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
          <MaxQuantityButton
            currentValue={quantityField.value() ?? 0}
            macroTargets={getAvailableMacros()}
            itemMacros={props.item().macros}
            onMaxSelected={(maxValue: number) => {
              debug('[Body] MaxQuantityButton onMaxSelected', maxValue)
              quantityField.setRawValue(maxValue.toFixed(2))
            }}
            disabled={!props.canApply}
          />
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

      <ItemView
        mode="edit"
        handlers={{
          onCopy: () => {
            clipboard.write(JSON.stringify(props.item()))
          },
        }}
        item={() =>
          ({
            __type: props.item().__type,
            id: id(),
            name: props.item().name,
            quantity: quantityField.value() ?? props.item().quantity,
            reference: props.item().reference,
            macros: props.item().macros,
          }) satisfies TemplateItem
        }
        macroOverflow={props.macroOverflow}
        class="mt-4"
        header={
          <HeaderWithActions
            name={<ItemName />}
            primaryActions={<ItemFavorite foodId={props.item().reference} />}
          />
        }
        nutritionalInfo={<ItemNutritionalInfo />}
      />
    </>
  )
}
