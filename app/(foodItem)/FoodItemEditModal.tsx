'use client'

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import FoodItemView from './FoodItemView'
import { FoodItem } from '@/model/foodItemModel'
import Modal, { ModalActions } from '../(modals)/Modal'
import { useUserContext } from '@/context/users.context'
import { useModalContext } from '../(modals)/ModalContext'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import { generateId } from '@/utils/idUtils'
import { useFloatField } from '@/hooks/field'
import { FloatInput } from '@/components/FloatInput'
import { TemplateItem } from '@/model/templateItemModel'

export type FoodItemEditModalProps = {
  targetName: string
  targetNameColor?: string
  foodItem: Partial<TemplateItem> & Pick<TemplateItem, 'reference' | 'macros'>
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
  const { visible, onSetVisible } = useModalContext()

  // TODO: Better initial state for foodItem on FoodItemEditModal
  const [foodItem, setFoodItem] = useState<TemplateItem>({
    __type: initialFoodItem?.__type ?? 'FoodItem',
    id: initialFoodItem?.id ?? generateId(),
    name: initialFoodItem?.name ?? 'ERRO: Sem nome',
    quantity: initialFoodItem?.quantity ?? 0,
    ...initialFoodItem,
  } satisfies TemplateItem)

  useEffect(() => {
    setFoodItem((old) => ({
      ...old,
      ...initialFoodItem,
    }))
  }, [initialFoodItem])

  const quantity = foodItem.quantity.toString()
  const setQuantity: Dispatch<SetStateAction<number>> = useCallback(
    (value: SetStateAction<number>) => {
      if (typeof value === 'function') {
        setFoodItem((old) => ({
          ...old,
          quantity: value(old.quantity),
        }))
      } else {
        setFoodItem((old) => ({
          ...old,
          quantity: value,
        }))
      }
    },
    [],
  )

  const canApply = quantity !== '' && Number(quantity) > 0

  return (
    <>
      <Modal
        header={
          <Header
            foodItem={foodItem}
            targetName={targetName}
            targetNameColor={targetNameColor}
          />
        }
        body={
          <Body
            visible={visible}
            onQuantityChanged={setQuantity}
            canApply={canApply}
            foodItem={foodItem}
          />
        }
        actions={
          <Actions
            id={foodItem.id}
            canApply={canApply}
            onApply={() => {
              onSetVisible(false)
              onApply(foodItem)
            }}
            onCancel={() => {
              onSetVisible(false)
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
  foodItem: TemplateItem
  targetName: string
  targetNameColor: string
}) {
  const { debug } = useUserContext()
  return (
    <>
      {debug && (
        <code className="text-xs text-gray-400">
          <pre>{JSON.stringify(foodItem, null, 2)}</pre>
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
  visible,
  onQuantityChanged,
  canApply,
  foodItem,
}: {
  visible: boolean
  onQuantityChanged: Dispatch<SetStateAction<number>>
  canApply: boolean
  foodItem: TemplateItem
}) {
  const id = foodItem.id
  const quantityRef = useRef<HTMLInputElement>(null)
  const dummyRef = useRef<HTMLDivElement>(null)
  const [quantityFieldDisabled, setQuantityFieldDisabled] = useState(false)

  const quantityField = useFloatField(foodItem.quantity || undefined, {
    decimalPlaces: 0,
    defaultValue: foodItem.quantity,
  })

  useEffect(() => {
    if (!visible) {
      setQuantityFieldDisabled(true)
      return
    }
    const timeout = setTimeout(() => {
      quantityRef.current?.blur()
      quantityField.setValue(foodItem.quantity)
      setQuantityFieldDisabled(false)
    }, 100)

    return () => {
      clearTimeout(timeout)
    }
    // TODO: Find a way to include foodItem.quantity in the deps array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, foodItem.quantity])

  useEffect(() => {
    onQuantityChanged(quantityField.value ?? 0)
  }, [quantityField.value, onQuantityChanged])

  const { isFoodFavorite, setFoodAsFavorite } = useUserContext()

  const [currentHoldTimeout, setCurrentHoldTimeout] = useState<NodeJS.Timeout>()
  const [currentHoldInterval, setCurrentHoldInterval] =
    useState<NodeJS.Timeout>()

  const increment = () => quantityField.setValue((old) => (old ?? 0) + 1)
  const decrement = () =>
    quantityField.setValue((old) => Math.max(0, (old ?? 0) - 1))

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
      <div className="dummy" ref={dummyRef}></div>
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
              onClick={() => quantityField.setValue(value)}
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
            onFieldChange={(value) =>
              value === undefined && quantityField.setValue(foodItem.quantity)
            }
            tabIndex={-1}
            onFocus={(event) => {
              event.target.select()
              if (quantityField.value === 0) {
                quantityField.setRawValue('')
              }
            }}
            ref={quantityRef}
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
        foodItem={
          {
            __type: foodItem.__type,
            id,
            name: foodItem.name ?? 'Sem nome (itemData && FoodItemView)',
            quantity: quantityField.value ?? foodItem.quantity,
            reference: foodItem.reference,
            macros: foodItem.macros,
          } satisfies TemplateItem
        }
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
                  (foodItem && isFoodFavorite(foodItem.reference)) || false
                }
                onSetFavorite={(favorite) =>
                  foodItem &&
                  // TODO: [Feature] Add recipe favorite
                  setFoodAsFavorite(foodItem.reference, favorite)
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
                message: 'Tem certeza que deseja excluir este item?',
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
