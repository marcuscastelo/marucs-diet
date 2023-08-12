'use client'

import {
  Dispatch,
  SetStateAction,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import FoodItemView from './FoodItemView'
import { FoodItem } from '@/model/foodItemModel'
import Modal, { ModalActions, ModalProps, ModalRef } from '../(modals)/Modal'
import { Recipe } from '@/model/recipeModel'
import { Loadable } from '@/utils/loadable'
import { useUserContext } from '@/context/users.context'
import { ModalContextProvider, useModalContext } from '../(modals)/ModalContext'
import { Consumable } from '../newItem/FoodSearch'

const RECIPE_EDIT_MODAL_ID = 'meal-item-add-modal:self:recipe-edit-modal'

// TODO: Add item name field
export type FoodItemEditModalProps = {
  modalId: string
  targetName: string
  targetNameColor?: string
  foodItem: Partial<FoodItem> &
    Pick<FoodItem, 'reference' | 'macros'> & { type?: 'food' | 'recipe' }
  onApply: (item: FoodItem & { type: 'food' | 'recipe' }) => void
  onCancel?: () => void
  onDelete?: (itemId: FoodItem['id']) => void
}

// eslint-disable-next-line react/display-name
const FoodItemEditModal = forwardRef(
  (
    {
      modalId,
      targetName,
      targetNameColor = 'text-green-500',
      foodItem: initialFoodItem,
      onApply,
      onCancel,
      onDelete,
    }: FoodItemEditModalProps,
    ref: React.Ref<ModalRef>,
  ) => {
    const {
      visible,
      setVisible,
      onVisibilityChange,
      modalRef: selfModalRef,
    } = useModalContext()

    const [showing, setShowing_] = useState(false)
    const [foodItem, setFoodItem] = useState<
      FoodItem & { type: 'food' | 'recipe' }
    >({
      id: initialFoodItem?.id ?? Math.round(Math.random() * 1000000),
      name: initialFoodItem?.name ?? 'ERRO: Sem nome',
      quantity: initialFoodItem?.quantity ?? 0,
      type: initialFoodItem?.type ?? 'food',
      ...initialFoodItem,
    } satisfies FoodItem & { type: 'food' | 'recipe' })

    useEffect(() => {
      setFoodItem((old) => ({
        ...old,
        ...initialFoodItem,
      }))
    }, [initialFoodItem])

    const quantity = foodItem.quantity.toString()
    const setQuantity: Dispatch<SetStateAction<string>> = (
      value: SetStateAction<string>,
    ) => {
      if (typeof value === 'function') {
        setFoodItem((old) => ({
          ...old,
          quantity: Number(value(old.quantity.toString())),
        }))
      } else {
        setFoodItem((old) => ({
          ...old,
          quantity: Number(value),
        }))
      }
    }

    const canAdd = quantity !== '' && Number(quantity) > 0

    const handleSetShowing = (isShowing: boolean) => {
      console.debug('FoodItemEditModal: handleSetShowing', isShowing)
      setShowing_(isShowing)
      onVisibilityChange?.(isShowing)
    }

    useImperativeHandle(ref, () => ({
      showModal: () => {
        selfModalRef.current?.showModal()
        handleSetShowing(true)
      },
      close: () => {
        selfModalRef.current?.close()
        handleSetShowing(false)
      },
    }))

    // TODO: Remove createMealItemData
    const createMealItemData = (): FoodItem & { type: 'food' | 'recipe' } =>
      ({
        ...foodItem,
      }) satisfies FoodItem & { type: 'food' | 'recipe' }

    return (
      <>
        {/* {itemData?.food.name.toString()}
        {itemData?.food.id.toString()}
        {itemData?.food.recipeId?.toString() ?? 'NO RECIPE ID'} */}
        {/* {recipe.loading.valueOf().toString()}
        {(!recipe.loading && JSON.stringify(recipe.data, null, 2)) ||
          'NO RECIPE DATA'} */}
        {/* <RecipeEditModal
          modalId={RECIPE_EDIT_MODAL_ID}
          ref={recipeEditModalRef}
          recipe={(!recipe.loading && recipe.data) || null}
          onSaveRecipe={async () => alert('TODO: Save recipe')}
        /> */}
        <ModalContextProvider
          visible={visible}
          onVisibilityChange={(...args) => handleSetShowing(...args)}
        >
          <Modal
            modalId={modalId}
            ref={selfModalRef}
            onSubmit={() => onApply(createMealItemData())}
            header={
              <Header
                foodItem={foodItem}
                targetName={targetName}
                targetNameColor={targetNameColor}
              />
            }
            body={
              <Body
                showing={showing}
                quantity={quantity}
                setQuantity={setQuantity}
                canAdd={canAdd}
                foodItem={foodItem}
                id={foodItem.id}
              />
            }
            actions={
              <Actions
                id={foodItem.id}
                canAdd={canAdd}
                onApply={() => {
                  selfModalRef.current?.close()
                  onApply(createMealItemData())
                }}
                onCancel={() => {
                  selfModalRef.current?.close()
                  onCancel?.()
                }}
                onDelete={onDelete}
              />
            }
          />
        </ModalContextProvider>
      </>
    )
  },
)

function Header({
  foodItem,
  targetName,
  targetNameColor,
}: {
  foodItem: FoodItem
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
  showing,
  quantity,
  setQuantity,
  canAdd,
  foodItem,
  id,
}: {
  showing: boolean
  quantity: string
  setQuantity: Dispatch<SetStateAction<string>>
  canAdd: boolean
  foodItem:
    | (Partial<FoodItem> &
        Pick<FoodItem, 'reference' | 'macros'> & {
          type: 'food' | 'recipe'
        })
    | null
  id: FoodItem['id']
}) {
  const quantityRef = useRef<HTMLInputElement>(null)

  const recipeEditModalRef = useRef<ModalRef>(null)

  const [recipe, setRecipe] = useState<Loadable<Recipe | null>>({
    loading: true,
  })

  // const [quantityFieldDisabled, setQuantityFieldDisabled] = useState(true)

  useEffect(() => {
    if (showing) {
      quantityRef.current?.blur()
    }
  }, [showing])

  const { isFoodFavorite, setFoodAsFavorite } = useUserContext()

  const [currentHoldTimeout, setCurrentHoldTimeout] = useState<NodeJS.Timeout>()
  const [currentHoldInterval, setCurrentHoldInterval] =
    useState<NodeJS.Timeout>()

  const increment = () =>
    setQuantity((old) => (Number(old ?? '0') + 1).toString())
  const decrement = () =>
    setQuantity((old) => Math.max(0, Number(old ?? '0') - 1).toString())

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
              onClick={() => setQuantity(value.toString())}
            >
              {value}g
            </div>
          ))}
        </div>
      ))}
      <div className="mt-3 flex w-full justify-between gap-1">
        <div className="my-1 flex flex-1 justify-around">
          <input
            style={{ width: '100%' }}
            value={quantity}
            ref={quantityRef}
            onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/, ''))}
            type="number"
            placeholder="Quantidade (gramas)"
            className={`input-bordered  input mt-1  border-gray-300 bg-gray-800 ${
              !canAdd ? 'input-error border-red-500' : ''
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
      {foodItem && (
        <FoodItemView
          foodItem={
            {
              id,
              name: foodItem.name ?? 'Sem nome (itemData && FoodItemView)',
              quantity: Number(quantity),
              reference: foodItem.reference,
              macros: foodItem.macros,
              type: foodItem.type,
            } satisfies FoodItem & { type: 'food' | 'recipe' }
          }
          className="mt-4"
          onClick={() => {
            alert('Alimento não editável (ainda)')
          }}
          header={
            <FoodItemView.Header
              name={<FoodItemView.Header.Name />}
              favorite={
                <FoodItemView.Header.Favorite
                  favorite={
                    // TODO: isRecipeFavorite as well
                    (foodItem && isFoodFavorite(foodItem.reference)) || false
                  }
                  onSetFavorite={(favorite) =>
                    foodItem &&
                    // TODO: setRecipeAsFavorite as well
                    setFoodAsFavorite(foodItem.reference, favorite)
                  }
                />
              }
            />
          }
          nutritionalInfo={<FoodItemView.NutritionalInfo />}
        />
      )}
    </>
  )
}

function Actions({
  id,
  canAdd,
  onDelete,
  onCancel,
  onApply,
}: {
  id: number
  canAdd: boolean
  onDelete?: (id: number) => void
  onCancel?: () => void
  onApply: () => void
}) {
  return (
    <ModalActions>
      {/* if there is a button in form, it will close the modal */}
      {onDelete && (
        <button
          className="btn-error btn mr-auto"
          onClick={(e) => {
            e.preventDefault()

            // TODO: Move confirm up to parent (also with all other confirmations)
            // TODO: Replace confirm with a modal
            if (confirm('Tem certeza que deseja excluir este item?')) {
              onDelete?.(id)
            }
          }}
        >
          Excluir
        </button>
      )}
      <button
        className="btn"
        onClick={(e) => {
          e.preventDefault()
          onCancel?.()
        }}
      >
        Cancelar
      </button>
      <button
        className="btn"
        disabled={!canAdd}
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
