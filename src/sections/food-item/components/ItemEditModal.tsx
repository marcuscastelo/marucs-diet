import {
  ItemFavorite,
  ItemName,
  ItemNutritionalInfo,
  ItemView,
} from '~/sections/food-item/components/ItemView'
import { type Item } from '~/modules/diet/item/domain/item'
import { Modal } from '~/sections/common/components/Modal'
import { useModalContext } from '~/sections/common/context/ModalContext'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { generateId } from '~/legacy/utils/idUtils'
import { useFloatField } from '~/sections/common/hooks/useField'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'

import {
  mergeProps,
  type Accessor,
  createSignal,
  createEffect,
  untrack,
  type Setter,
  For,
} from 'solid-js'
import { showError } from '~/modules/toast/application/toastManager'

export type ItemEditModalProps = {
  targetName: string
  targetNameColor?: string
  item: Accessor<
    Partial<TemplateItem> & Pick<TemplateItem, 'name' | 'reference' | 'macros'>
  >
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

  // TODO:   Better initial state for item on ItemEditModal
  const fallbackItem: TemplateItem = {
    __type: 'Item',
    id: generateId(),
    name: '',
    quantity: 0,
    reference: 0, // assuming number, adjust if needed
    macros: { carbs: 0, protein: 0, fat: 0 },
  }
  const [item, setItem] = createSignal<TemplateItem>(fallbackItem)
  createEffect(() => {
    setItem({
      ...props.item(),
      __type: props.item().__type ?? 'Item',
      id: props.item().id ?? generateId(),
      quantity: props.item().quantity ?? 0,
      name: props.item().name ?? '',
      reference: props.item().reference ?? 0,
      macros: props.item().macros ?? { carbs: 0, protein: 0, fat: 0 },
    })
  })

  const canApply = () => item().quantity > 0

  return (
    <Modal class="border-2 border-white">
      <Modal.Header
        title={
          <span>
            Editando item em
            <span class={props.targetNameColor}>
              {' '}
              &quot;{props.targetName ?? 'ERRO: destino desconhecido'}
              &quot;{' '}
            </span>
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
            class="btn-error btn mr-auto"
            onClick={(e) => {
              e.preventDefault()
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
          class="btn"
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
          class="btn"
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
                  class="btn-primary btn-sm btn flex-1"
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
        <div class="my-1 ml-1 flex flex-shrink justify-around gap-1">
          <div
            class="btn-primary btn-xs btn h-full w-10 px-6 text-4xl text-red-600"
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
            class="btn-primary btn-xs btn ml-1 h-full w-10 px-6 text-4xl text-green-400"
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
            name: props.item().name ?? 'Sem nome (itemData && ItemView)',
            quantity: quantityField.value() ?? props.item().quantity,
            reference: props.item().reference,
            macros: props.item().macros,
          }) satisfies TemplateItem
        }
        macroOverflow={props.macroOverflow}
        class="mt-4"
        onClick={() => {
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
