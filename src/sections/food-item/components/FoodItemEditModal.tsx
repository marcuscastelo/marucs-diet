'use client'

import { useState } from 'react'
import FoodItemView from '@/sections/food-item/components/FoodItemView'
import { FoodItem } from '@/src/modules/diet/food-item/domain/foodItem'
import Modal, { ModalActions } from '@/sections/common/components/Modal'
import { useUserContext } from '@/sections/user/context/UserContext'
import { useModalContext } from '@/sections/common/context/ModalContext'
import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { generateId } from '@/legacy/utils/idUtils'
import { useFloatField } from '@/sections/common/hooks/useField'
import { FloatInput } from '@/sections/common/components/FloatInput'
import { TemplateItem } from '@/src/modules/diet/template-item/domain/templateItem'
import {
  ReadonlySignal,
  Signal,
  computed,
  useSignal,
  useSignalEffect,
} from '@preact/signals-react'

export type FoodItemEditModalProps = {
  targetName: string
  targetNameColor?: string
  foodItem: ReadonlySignal<
    Partial<TemplateItem> & Pick<TemplateItem, 'reference' | 'macros'>
  >
  onApply: (item: TemplateItem) => void
  onCancel?: () => void
  onDelete?: (itemId: FoodItem['id']) => void
}

// TODO: rename to ItemEditModal (also foodItemEditModalVisible and derivatives)
const FoodItemEditModal = ({
  targetName,
  targetNameColor = 'text-green-500',
  foodItem: initialFoodItem,
  onApply,
  onCancel,
  onDelete,
}: FoodItemEditModalProps) => {
  const { visible } = useModalContext()

  // TODO: Better initial state for foodItem on FoodItemEditModal
  const foodItem = useSignal<TemplateItem>({
    __type: initialFoodItem.value?.__type ?? 'FoodItem',
    id: initialFoodItem.value?.id ?? generateId(),
    name: initialFoodItem.value?.name ?? 'ERRO: Sem nome',
    quantity: initialFoodItem.value?.quantity ?? 0,
    ...initialFoodItem.value,
  } satisfies TemplateItem)

  useSignalEffect(() => {
    foodItem.value = {
      ...foodItem.peek(),
      ...initialFoodItem.value,
    }
  })

  const canApply = foodItem.value.quantity > 0

  return (
    <>
      <Modal
        className="border-2 border-white"
        header={
          <Header
            foodItem={foodItem}
            targetName={targetName}
            targetNameColor={targetNameColor}
          />
        }
        body={<Body canApply={canApply} foodItem={foodItem} />}
        actions={
          <Actions
            id={foodItem.value.id}
            canApply={canApply}
            onApply={() => {
              console.debug(
                `[FoodItemEditModal] onApply - calling onApply with foodItem.value=`,
                foodItem.value,
              )
              onApply(foodItem.value)
              visible.value = false
            }}
            onCancel={() => {
              visible.value = false
              onCancel?.()
            }}
            onDelete={onDelete}
          />
        }
      />
    </>
  )
}

function Header({
  foodItem, // TODO: rename all foodItem to TemplateItem
  targetName,
  targetNameColor,
}: {
  foodItem: Signal<TemplateItem>
  targetName: string
  targetNameColor: string
}) {
  const { debug } = useUserContext()
  return (
    <>
      {debug && (
        <code className="text-xs text-gray-400">
          <pre>{JSON.stringify(foodItem.value, null, 2)}</pre>
        </code>
      )}
      <h3 className="text-lg font-bold text-white">
        Editando item em
        <span className={targetNameColor}>
          {' '}
          &quot;{targetName ?? 'ERRO: destino desconhecido'}&quot;{' '}
        </span>
      </h3>
    </>
  )
}

function Body({
  canApply,
  foodItem,
}: {
  canApply: boolean
  foodItem: Signal<TemplateItem>
}) {
  const id = foodItem.value.id
  const [quantityFieldDisabled, setQuantityFieldDisabled] = useState(false)

  const quantitySignal = computed(() => foodItem.value.quantity || undefined)
  const quantityField = useFloatField(quantitySignal, {
    decimalPlaces: 0,
    defaultValue: foodItem.value.quantity,
  })

  useSignalEffect(() => {
    foodItem.value = {
      ...foodItem.peek(),
      quantity: quantityField.value.value ?? 0,
    }
  })

  const { isFoodFavorite, setFoodAsFavorite } = useUserContext()

  const [currentHoldTimeout, setCurrentHoldTimeout] = useState<NodeJS.Timeout>()
  const [currentHoldInterval, setCurrentHoldInterval] =
    useState<NodeJS.Timeout>()

  const increment = () =>
    (quantityField.rawValue.value = (
      (quantityField.value.value ?? 0) + 1
    ).toString())
  const decrement = () =>
    (quantityField.rawValue.value = Math.max(
      0,
      (quantityField.value.value ?? 0) - 1,
    ).toString())

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
    if (currentHoldTimeout) {
      clearTimeout(currentHoldTimeout)
    }

    if (currentHoldInterval) {
      clearInterval(currentHoldInterval)
    }
  }

  return (
    <>
      <p className="mt-1 text-gray-400">Atalhos</p>
      {[
        [10, 20, 30, 40, 50],
        [100, 150, 200, 250, 300],
      ].map((row, rowIndex) => (
        <div
          key={`shortcuts-row-${rowIndex}`}
          className="mt-1 flex w-full gap-1"
        >
          {row.map((value, index) => (
            <div
              key={`shortcuts-row-${rowIndex}-button-${index}}`}
              className="btn-primary btn-sm btn flex-1"
              onClick={() => (quantityField.rawValue.value = value.toString())}
            >
              {value}g
            </div>
          ))}
        </div>
      ))}
      <div className="mt-3 flex w-full justify-between gap-1">
        <div className="my-1 flex flex-1 justify-around">
          <FloatInput
            field={quantityField}
            style={{ width: '100%' }}
            onFieldCommit={(value) =>
              value === undefined &&
              (quantityField.rawValue.value =
                foodItem.value.quantity.toString())
            }
            tabIndex={-1}
            onFocus={(event) => {
              event.target.select()
              if (quantityField.value.value === 0) {
                quantityField.rawValue.value = ''
              }
            }}
            disabled={quantityFieldDisabled}
            type="number"
            placeholder="Quantidade (gramas)"
            className={`input-bordered  input mt-1  border-gray-300 bg-gray-800 ${
              !canApply ? 'input-error border-red-500' : ''
            }`}
          />
        </div>
        <div className="my-1 ml-1 flex flex-shrink justify-around gap-1">
          <div
            className="btn-primary btn-xs btn h-full w-10 px-6 text-4xl text-red-600"
            onClick={decrement}
            onMouseDown={() => holdRepeatStart(decrement)}
            onMouseUp={holdRepeatStop}
            onTouchStart={() => holdRepeatStart(decrement)}
            onTouchEnd={holdRepeatStop}
          >
            {' '}
            -{' '}
          </div>
          <div
            className="btn-primary btn-xs btn ml-1 h-full w-10 px-6 text-4xl text-green-400"
            onClick={increment}
            onMouseDown={() => holdRepeatStart(increment)}
            onMouseUp={holdRepeatStop}
            onTouchStart={() => holdRepeatStart(increment)}
            onTouchEnd={holdRepeatStop}
          >
            {' '}
            +{' '}
          </div>
        </div>
      </div>

      <FoodItemView
        foodItem={computed(
          () =>
            ({
              __type: foodItem.value.__type,
              id,
              name:
                foodItem.value.name ?? 'Sem nome (itemData && FoodItemView)',
              quantity: quantityField.value.value ?? foodItem.value.quantity,
              reference: foodItem.value.reference,
              macros: foodItem.value.macros,
            }) satisfies TemplateItem,
        )}
        className="mt-4"
        onClick={() => {
          // alert('Alimento não editável (ainda)') // TODO: Change all alerts with ConfirmModal
        }}
        header={
          <FoodItemView.Header
            name={<FoodItemView.Header.Name />}
            favorite={
              <FoodItemView.Header.Favorite
                favorite={
                  // TODO: [Feature] Add recipe favorite
                  (foodItem && isFoodFavorite(foodItem.value.reference)) ||
                  false
                }
                onSetFavorite={(favorite) =>
                  foodItem &&
                  // TODO: [Feature] Add recipe favorite
                  setFoodAsFavorite(foodItem.value.reference, favorite)
                }
              />
            }
          />
        }
        nutritionalInfo={<FoodItemView.NutritionalInfo />}
      />
    </>
  )
}
// TODO: Unify Header, Content and Actions for each component in the entire app
/**
 * @deprecated
 */
function Actions({
  id,
  canApply,
  onDelete,
  onCancel,
  onApply,
}: {
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
      {onDelete && (
        <button
          className="btn-error btn mr-auto"
          onClick={(e) => {
            e.preventDefault()

            onDelete &&
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
                      onDelete?.(id)
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
        className="btn"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onCancel?.()
        }}
      >
        Cancelar
      </button>
      <button
        className="btn"
        disabled={!canApply}
        onClick={(e) => {
          e.preventDefault()
          onApply() // TODO: pass data inside onApply()
        }}
      >
        Aplicar
      </button>
    </ModalActions>
  )
}

export default FoodItemEditModal
