import {
  type Accessor,
  createEffect,
  createSignal,
  For,
  mergeProps,
  type Setter,
  untrack,
} from 'solid-js'

import { type Item } from '~/modules/diet/item/domain/item'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { showError } from '~/modules/toast/application/toastManager'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import { Modal } from '~/sections/common/components/Modal'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { useFloatField } from '~/sections/common/hooks/useField'
import {
  ItemFavorite,
  ItemName,
  ItemNutritionalInfo,
  ItemView,
} from '~/sections/food-item/components/ItemView'

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
  onDelete?: (itemId: Item['id']) => void
}

export const ItemEditModal = (_props: ItemEditModalProps) => {
  const props = mergeProps({ targetNameColor: 'text-green-500' }, _props)
  const { setVisible } = useModalContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  const [item, setItem] = createSignal(untrack(() => props.item()))
  createEffect(() => setItem(props.item()))

  const canApply = () => item().quantity > 0

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
        {props.onDelete !== undefined && (
          <button
            class="btn-error btn cursor-pointer uppercase mr-auto"
            onClick={(e) => {
              e.preventDefault()
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              props.onDelete !== undefined &&
                showConfirmModal({
                  title: 'Excluir item',
                  body: 'Tem certeza que deseja excluir este item?',
                  actions: [
                    {
                      text: 'Cancelar',
                      onClick: () => undefined,
                    },
                    {
                      text: 'Excluir',
                      primary: true,
                      onClick: () => {
                        props.onDelete?.(item().id)
                        setVisible(false)
                      },
                    },
                  ],
                })
            }}
          >
            Excluir
          </button>
        )}
        <button
          class="btn cursor-pointer uppercase"
          onClick={(e) => {
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
  const id = () => props.item().id

  const quantitySignal = () =>
    props.item().quantity === 0 ? undefined : props.item().quantity

  const quantityField = useFloatField(quantitySignal, {
    decimalPlaces: 0,
    // eslint-disable-next-line solid/reactivity
    defaultValue: props.item().quantity,
  })

  createEffect(() => {
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
    quantityField.setRawValue(((quantityField.value() ?? 0) + 1).toString())
  }
  const decrement = () => {
    quantityField.setRawValue(
      Math.max(0, (quantityField.value() ?? 0) - 1).toString(),
    )
  }

  const holdRepeatStart = (action: () => void) => {
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
    const currentHoldTimeout_ = currentHoldTimeout()
    const currentHoldInterval_ = currentHoldInterval()

    if (currentHoldTimeout_ !== null) {
      clearTimeout(currentHoldTimeout_)
    }

    if (currentHoldInterval_ !== null) {
      clearInterval(currentHoldInterval_)
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
        <div class="my-1 flex flex-1 justify-around">
          <FloatInput
            field={quantityField}
            style={{ width: '100%' }}
            onFieldCommit={(value) => {
              if (value === undefined) {
                quantityField.setRawValue(props.item().quantity.toString())
              }
            }}
            tabIndex={-1}
            onFocus={(event) => {
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
        </div>
        <div class="my-1 ml-1 flex shrink justify-around gap-1">
          <div
            class="btn-primary btn-xs btn cursor-pointer uppercase h-full w-10 px-6 text-4xl text-red-600"
            onClick={decrement}
            onMouseDown={() => {
              holdRepeatStart(decrement)
            }}
            onMouseUp={holdRepeatStop}
            onTouchStart={() => {
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
              holdRepeatStart(increment)
            }}
            onMouseUp={holdRepeatStop}
            onTouchStart={() => {
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
        onClick={() => {
          // TODO: Implement item editing
          showError('Alimento não editável (ainda)')
        }}
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
