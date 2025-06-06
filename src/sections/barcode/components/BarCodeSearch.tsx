import { type Food } from '~/modules/diet/food/domain/food'
import { createItem } from '~/modules/diet/item/domain/item'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import {
  ItemFavorite,
  ItemName,
  ItemNutritionalInfo,
  ItemView,
} from '~/sections/food-item/components/ItemView'
import { handleApiError } from '~/shared/error/errorHandler'

import {
  type Accessor,
  createEffect,
  createSignal,
  type Setter,
  Show,
} from 'solid-js'
import { fetchFoodByEan } from '~/modules/diet/food/application/food'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { formatError } from '~/shared/formatError'

export type BarCodeSearchProps = {
  barCode: Accessor<string>
  setBarCode: Setter<string>
  food: Accessor<Food | null>
  setFood: Setter<Food | null>
}

export default function BarCodeSearch(props: BarCodeSearchProps) {
  const [loading, setLoading] = createSignal(false)
  const { show: showConfirmModal } = useConfirmModalContext()

  const EAN_LENGTH = 13

  createEffect(() => {
    if (props.barCode().length !== EAN_LENGTH) {
      if (props.barCode().length > 0) {
        props.setFood(null)
      }
      return
    }

    setLoading(true)

    const afterFetch = (food: Food | null) => {
      console.log('afterFetch food', food)
      if (food === null) {
        showConfirmModal({
          title: `Não encontrado`,
          body: `Alimento de EAN ${props.barCode()} não encontrado`,
          actions: [{ text: 'OK', primary: true, onClick: () => {} }],
        })
        return
      }
      props.setFood(food)
    }

    const catchFetch = (err: unknown) => {
      console.log('catchFetch err', err)
      handleApiError(err, {
        component: 'BarCodeSearch',
        operation: 'fetchFoodByEan',
        additionalData: { barCode: props.barCode() },
      })
      showConfirmModal({
        title: `Erro ao buscar alimento de EAN ${props.barCode()}`,
        body: `Erro: ${formatError(err)}`,
        actions: [{ text: 'OK', primary: true, onClick: () => {} }],
      })
      props.setFood(null)
    }

    const finallyFetch = () => {
      console.log('finallyFetch')
      setLoading(false)
      props.setBarCode('')
    }

    fetchFoodByEan(props.barCode())
      .then(afterFetch)
      .catch(catchFetch)
      .finally(finallyFetch)
  })

  return (
    <div>
      <h3 class="text-lg font-bold text-white">
        Busca por código de barras (EAN)
      </h3>

      <div class="w-full text-center">
        <div
          class={`loading loading-lg transition-all ${
            loading() ? 'h-80' : 'h-0'
          }`}
        />
      </div>

      <Show when={props.food()}>
        {(food) => (
          <div class="mt-3 flex flex-col">
            <div class="flex">
              <div class="flex-1">
                <p class="font-bold">{food().name}</p>
                <p class="text-sm">
                  <ItemView
                    item={() =>
                      createItem({
                        name: food().name,
                        reference: food().id,
                        quantity: 100,
                        macros: { ...food().macros },
                      })
                    }
                    macroOverflow={() => ({
                      enable: false,
                    })}
                    header={
                      <HeaderWithActions
                        name={<ItemName />}
                        primaryActions={<ItemFavorite foodId={food().id} />}
                      />
                    }
                    nutritionalInfo={<ItemNutritionalInfo />}
                  />
                </p>
              </div>
            </div>
          </div>
        )}
      </Show>

      <div class="mt-3 flex">
        <input
          type="number"
          placeholder="Código de barras (Ex: 7891234567890)"
          class={'input-bordered input mt-1 flex-1 border-gray-300 bg-gray-800'}
          value={props.barCode()}
          onChange={(e) => props.setBarCode(e.target.value.slice(0, 13))}
        />
      </div>
    </div>
  )
}
