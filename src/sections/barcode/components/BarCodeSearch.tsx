import {
  FoodItemFavorite,
  FoodItemHeader,
  FoodItemName,
  FoodItemNutritionalInfo,
  FoodItemView,
} from '~/sections/food-item/components/FoodItemView'
import { type Food } from '~/modules/diet/food/domain/food'
import { createFoodItem } from '~/modules/diet/food-item/domain/foodItem'
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

export type BarCodeSearchProps = {
  barCode: Accessor<string>
  setBarCode: Setter<string>
  food: Accessor<Food | null>
  setFood: Setter<Food | null>
}

export default function BarCodeSearch(props: BarCodeSearchProps) {
  const [loading, setLoading] = createSignal(false)

  const EAN_LENGTH = 13

  createEffect(() => {
    if (props.barCode().length !== EAN_LENGTH) {
      return
    }

    setLoading(true)

    const afterFetch = props.setFood
    const catchFetch = (err: any) => {
      props.setFood(null)
      console.error(err)
      alert(JSON.stringify(err, null, 2)) // TODO: Change all alerts with ConfirmModal
    }

    fetchFoodByEan(props.barCode())
      .then(afterFetch)
      .catch(catchFetch)
      .finally(() => {
        setLoading(false)
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
                      createFoodItem({
                        name: food().name,
                        reference: food().id,
                        quantity: 100,
                        macros: {
                          ...(food().macros ??
                            createFoodItem({
                              name: food().name,
                              reference: food().id,
                            }).macros),
                        } satisfies MacroNutrients,
                      })
                    }
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
