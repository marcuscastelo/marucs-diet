import {
  FoodItemFavorite,
  FoodItemHeader,
  FoodItemName,
  FoodItemNutritionalInfo,
  FoodItemView,
} from '~/sections/food-item/components/FoodItemView'
import { type Food } from '~/modules/diet/food/domain/food'
import { createItem } from '~/modules/diet/item/domain/item'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'

import {
  isFoodFavorite,
  setFoodAsFavorite,
} from '~/modules/user/application/user'
import {
  type Accessor,
  createSignal,
  createEffect,
  type Setter,
  Show,
} from 'solid-js'
import { fetchFoodByEan } from '~/modules/diet/food/application/food'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'

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
      if (!food) {
        showConfirmModal({
          title: `Não encontrado`,
          body: `Alimento de EAN ${props.barCode()} não encontrado`,
          actions: [
            { text: 'OK', primary: true, onClick: () => {} },
          ]
        })
        return
      }
      props.setFood(food)
    }

    const catchFetch = (err: any) => {
      console.log('catchFetch err', err)
      console.error(err)
      showConfirmModal({
        title: `Erro ao buscar alimento de EAN ${props.barCode()}`,
        body: `Erro: ${err}`,
        actions: [
          { text: 'OK', primary: true, onClick: () => {} },
        ]
      })
      props.setFood(null)
    }

    fetchFoodByEan(props.barCode())
      .then(afterFetch)
      .catch(catchFetch)
      .finally(() => {
        console.log('finally')
        setLoading(false)
        props.setBarCode('')
      })
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
                  <FoodItemView
                    foodItem={() =>
                      createItem({
                        name: food().name,
                        reference: food().id,
                        quantity: 100,
                        macros: {
                          ...(food().macros ??
                            createItem({
                              name: food().name,
                              reference: food().id,
                            }).macros),
                        } satisfies MacroNutrients,
                      })
                    }
                    macroOverflow={() => ({
                      enable: false,
                    })}
                    header={
                      <FoodItemHeader
                        name={<FoodItemName />}
                        favorite={
                          <FoodItemFavorite
                            favorite={isFoodFavorite(food().id)}
                            onSetFavorite={(favorite) => {
                              setFoodAsFavorite(food().id, favorite)
                            }}
                          />
                        }
                      />
                    }
                    nutritionalInfo={<FoodItemNutritionalInfo />}
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
