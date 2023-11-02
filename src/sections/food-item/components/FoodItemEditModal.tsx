import { FoodItemFavorite, FoodItemHeader, FoodItemName, FoodItemNutritionalInfo, FoodItemView } from '@/sections/food-item/components/FoodItemView'
import { type FoodItem } from '@/modules/diet/food-item/domain/foodItem'
import { Modal, ModalActions } from '@/sections/common/components/Modal'
import { useModalContext } from '@/sections/common/context/ModalContext'
import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { generateId } from '@/legacy/utils/idUtils'
import { useFloatField } from '@/sections/common/hooks/useField'
import { FloatInput } from '@/sections/common/components/FloatInput'
import { type TemplateItem } from '@/modules/diet/template-item/domain/templateItem'

import {
  isFoodFavorite,
  setFoodAsFavorite
} from '@/modules/user/application/user'
import { mergeProps, type Accessor, createSignal, createEffect, untrack, type Setter, For } from 'solid-js'

export type FoodItemEditModalProps = {
  targetName: string
  targetNameColor?: string
  foodItem: Accessor<
  Partial<TemplateItem> & Pick<TemplateItem, 'reference' | 'macros'>
  >
  onApply: (item: TemplateItem) => void
  onCancel?: () => void
  onDelete?: (itemId: FoodItem['id']) => void
}

// TODO: rename to ItemEditModal (also foodItemEditModalVisible and derivatives)
export const FoodItemEditModal = (_props: FoodItemEditModalProps) => {
  const props = mergeProps({ targetNameColor: 'text-green-500' }, _props)
  const { setVisible } = useModalContext()

  // TODO: Better initial state for foodItem on FoodItemEditModal
  const [foodItem, setFoodItem] = createSignal<TemplateItem>({
    // eslint-disable-next-line solid/reactivity
    __type: props.foodItem()?.__type ?? 'FoodItem',
    // eslint-disable-next-line solid/reactivity
    id: props.foodItem()?.id ?? generateId(),
    // eslint-disable-next-line solid/reactivity
    name: props.foodItem()?.name ?? 'ERRO: Sem nome',
    // eslint-disable-next-line solid/reactivity
    quantity: props.foodItem()?.quantity ?? 0,
    // eslint-disable-next-line solid/reactivity
    ...props.foodItem()
  } satisfies TemplateItem)

  createEffect(() => {
    setFoodItem({
      ...untrack(foodItem),
      ...props.foodItem()
    })
  })

  const canApply = () => foodItem().quantity > 0

  return (
    <>
      <Modal
        class="border-2 border-white"
        header={
          <Header
            foodItem={foodItem}
            targetName={props.targetName}
            targetNameColor={props.targetNameColor}
          />
        }
        body={<Body canApply={canApply()} foodItem={foodItem} setFoodItem={setFoodItem} />}
        actions={
          <Actions
            id={foodItem().id}
            canApply={canApply()}
            onApply={() => {
              console.debug(
                '[FoodItemEditModal] onApply - calling onApply with foodItem.value=',
                foodItem()
              )
              props.onApply(foodItem())
              setVisible(false)
            }}
            onCancel={() => {
              setVisible(false)
              props.onCancel?.()
            }}
            onDelete={props.onDelete}
          />
        }
      />
    </>
  )
}

function Header (props: {
  foodItem: Accessor<TemplateItem>
  targetName: string
  targetNameColor: string
}) {
  return (
    <>
      <h3 class="text-lg font-bold text-white">
        Editando item em
        <span class={props.targetNameColor}>
          {' '}
          &quot;{props.targetName ?? 'ERRO: destino desconhecido'}&quot;{' '}
        </span>
      </h3>
    </>
  )
}

function Body (props: {
  canApply: boolean
  foodItem: Accessor<TemplateItem>
  setFoodItem: Setter<TemplateItem>
}) {
  const id = () => props.foodItem().id

  const quantitySignal = () => props.foodItem().quantity === 0 ? undefined : props.foodItem().quantity
  const quantityField = useFloatField(quantitySignal, {
    decimalPlaces: 0,
    defaultValue: props.foodItem().quantity
  })

  createEffect(() => {
    props.setFoodItem({
      ...untrack(props.foodItem),
      quantity: quantityField.value() ?? 0
    })
  })

  const [currentHoldTimeout, setCurrentHoldTimeout] = createSignal<NodeJS.Timeout | null>(null)
  const [currentHoldInterval, setCurrentHoldInterval] = createSignal<NodeJS.Timeout | null>(null)

  const increment = () =>
    quantityField.setRawValue((
      (quantityField.value() ?? 0) + 1
    ).toString())
  const decrement = () =>
    quantityField.setRawValue(Math.max(
      0,
      (quantityField.value() ?? 0) - 1
    ).toString())

  const holdRepeatStart = (action: () => void) => {
    setCurrentHoldTimeout(setTimeout(() => {
      setCurrentHoldInterval(setInterval(() => {
        action()
      }, 100))
    }, 500))
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
      {[
        [10, 20, 30, 40, 50],
        [100, 150, 200, 250, 300]
      ].map((row) => (
        <div

          class="mt-1 flex w-full gap-1"
        >
          <For each={row}>
            {(value) => (
              <div
                class="btn-primary btn-sm btn flex-1"
                onClick={() => (quantityField.setRawValue(value.toString()))}
              >
                {value}g
              </div>
            )}
          </For>
        </div>
      ))}
      <div class="mt-3 flex w-full justify-between gap-1">
        <div class="my-1 flex flex-1 justify-around">
          <FloatInput
            field={quantityField}
            style={{ width: '100%' }}
            onFieldCommit={(value) =>
              value === undefined &&
              quantityField.setRawValue(
                props.foodItem().quantity.toString())
            }
            tabIndex={-1}
            onFocus={(event) => {
              event.target.select()
              if (quantityField.value() === 0) {
                quantityField.setRawValue('')
              }
            }}
            type="number"
            placeholder="Quantidade (gramas)"
            class={`input-bordered  input mt-1  border-gray-300 bg-gray-800 ${!props.canApply ? 'input-error border-red-500' : ''
              }`}
          />
        </div>
        <div class="my-1 ml-1 flex flex-shrink justify-around gap-1">
          <div
            class="btn-primary btn-xs btn h-full w-10 px-6 text-4xl text-red-600"
            onClick={decrement}
            onMouseDown={() => { holdRepeatStart(decrement) }}
            onMouseUp={holdRepeatStop}
            onTouchStart={() => { holdRepeatStart(decrement) }}
            onTouchEnd={holdRepeatStop}
          >
            {' '}
            -{' '}
          </div>
          <div
            class="btn-primary btn-xs btn ml-1 h-full w-10 px-6 text-4xl text-green-400"
            onClick={increment}
            onMouseDown={() => { holdRepeatStart(increment) }}
            onMouseUp={holdRepeatStop}
            onTouchStart={() => { holdRepeatStart(increment) }}
            onTouchEnd={holdRepeatStop}
          >
            {' '}
            +{' '}
          </div>
        </div>
      </div>

      <FoodItemView
        foodItem={(
          () =>
            ({
              __type: props.foodItem().__type,
              id: id(),
              name:
                props.foodItem().name ?? 'Sem nome (itemData && FoodItemView)',
              quantity: quantityField.value() ?? props.foodItem().quantity,
              reference: props.foodItem().reference,
              macros: props.foodItem().macros
            }) satisfies TemplateItem
        )}
        class="mt-4"
        onClick={() => {
          // alert('Alimento não editável (ainda)') // TODO: Change all alerts with ConfirmModal
        }}
        header={
          <FoodItemHeader
            name={<FoodItemName />}
            favorite={
              <FoodItemFavorite
                favorite={
                  // TODO: [Feature] Add recipe favorite
                  (isFoodFavorite(props.foodItem().reference)) ||
                  false
                }
                onSetFavorite={(favorite) => {
                  // TODO: [Feature] Add recipe favorite
                  setFoodAsFavorite(props.foodItem().reference, favorite)
                }
                }
              />
            }
          />
        }
        nutritionalInfo={<FoodItemNutritionalInfo />}
      />
    </>
  )
}
// TODO: Unify Header, Content and Actions for each component in the entire app
/**
 * @deprecated
 */
function Actions (props: {
  id: number
  canApply: boolean
  onDelete?: (id: number) => void
  onCancel?: () => void
  onApply: () => void
}) {
  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <ModalActions>
      {/* if there is a button in form, it will close the modal */}
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
                    onClick: () => undefined
                  },
                  {
                    text: 'Excluir',
                    primary: true,
                    onClick: () => {
                      props.onDelete?.(props.id)
                    }
                  }
                ]
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
          props.onCancel?.()
        }}
      >
        Cancelar
      </button>
      <button
        class="btn"
        disabled={!props.canApply}
        onClick={(e) => {
          e.preventDefault()
          props.onApply() // TODO: pass data inside onApply()
        }}
      >
        Aplicar
      </button>
    </ModalActions>
  )
}
