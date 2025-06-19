import {
  type Accessor,
  createEffect,
  createSignal,
  mergeProps,
  Show,
  untrack,
} from 'solid-js'

import {
  isFood,
  isRecipe,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { Modal } from '~/sections/common/components/Modal'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { useFloatField } from '~/sections/common/hooks/useField'
import { UnifiedItemEditBody } from '~/sections/unified-item/components/UnifiedItemEditBody'
import { UnsupportedItemMessage } from '~/sections/unified-item/components/UnsupportedItemMessage'
import { createDebug } from '~/shared/utils/createDebug'

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

  const quantitySignal = () =>
    item().quantity === 0 ? undefined : item().quantity

  const quantityField = useFloatField(quantitySignal, {
    decimalPlaces: 0,
    // eslint-disable-next-line solid/reactivity
    defaultValue: item().quantity,
    minValue: 0.01,
  })

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
          <UnifiedItemEditBody
            canApply={canApply()}
            item={item}
            setItem={setItem}
            macroOverflow={props.macroOverflow}
            quantityField={quantityField}
          />
        </Show>
        <Show when={!isFood(item()) && !isRecipe(item())}>
          <UnsupportedItemMessage />
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
