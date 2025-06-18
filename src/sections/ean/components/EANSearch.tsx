import {
  type Accessor,
  createEffect,
  createSignal,
  type Setter,
  Show,
} from 'solid-js'

import { fetchFoodByEan } from '~/modules/diet/food/application/food'
import { type Food } from '~/modules/diet/food/domain/food'
import { createItem } from '~/modules/diet/item/domain/item'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { useClipboard } from '~/sections/common/hooks/useClipboard'
import {
  ItemFavorite,
  ItemName,
  ItemNutritionalInfo,
  ItemView,
} from '~/sections/food-item/components/ItemView'
import { handleApiError } from '~/shared/error/errorHandler'

export type EANSearchProps = {
  EAN: Accessor<string>
  setEAN: Setter<string>
  food: Accessor<Food | null>
  setFood: Setter<Food | null>
}

export function EANSearch(props: EANSearchProps) {
  const [loading, setLoading] = createSignal(false)
  const { show: showConfirmModal } = useConfirmModalContext()
  const clipboard = useClipboard()

  const EAN_LENGTH = 13

  createEffect(() => {
    if (props.EAN().length !== EAN_LENGTH) {
      if (props.EAN().length > 0) {
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
          body: `Alimento de EAN ${props.EAN()} não encontrado`,
          actions: [{ text: 'OK', primary: true, onClick: () => {} }],
        })
        return
      }
      props.setFood(food)
    }

    const catchFetch = (err: unknown) => {
      console.log('catchFetch err', err)
      handleApiError(err)
      showConfirmModal({
        title: `Erro ao buscar alimento de EAN ${props.EAN()}`,
        body: 'Erro ao buscar alimento',
        actions: [{ text: 'OK', primary: true, onClick: () => {} }],
      })
      props.setFood(null)
    }

    const finallyFetch = () => {
      console.log('finallyFetch')
      setLoading(false)
      props.setEAN('')
    }

    fetchFoodByEan(props.EAN())
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
                    handlers={{
                      // TODO : default handlers for ItemView
                      onCopy: (item) => {
                        clipboard.write(JSON.stringify(item))
                      },
                    }}
                    mode="read-only"
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
          value={props.EAN()}
          onChange={(e) => props.setEAN(e.target.value.slice(0, 13))}
        />
      </div>
    </div>
  )
}
