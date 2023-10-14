'use client'

import { useEffect, useState } from 'react'
import FoodItemView from '@/sections/template/item/components/FoodItemView'
import { searchFoodsByEan } from '@/legacy/controllers/food'
import { Food } from '@/legacy/model/foodModel'
import { useUserContext } from '@/sections/user/context/UserContext'
import { createFoodItem } from '@/legacy/model/foodItemModel'
import { MacroNutrients } from '@/legacy/model/macroNutrientsModel'
import {
  Signal,
  computed,
  useSignal,
  useSignalEffect,
} from '@preact/signals-react'

export type BarCodeSearchProps = {
  barCode: Signal<string>
  food: Signal<Food | null>
}

export default function BarCodeSearch({ barCode, food }: BarCodeSearchProps) {
  const loading = useSignal(false)

  const { isFoodFavorite, setFoodAsFavorite } = useUserContext()

  const EAN_LENGTH = 13

  useSignalEffect(() => {
    if (barCode.value.length !== EAN_LENGTH) {
      return
    }

    loading.value = true
    searchFoodsByEan(barCode.value)
      .then((newFood) => {
        food.value = newFood
      })
      .catch((err) => {
        food.value = null
        console.error(err)
        alert(JSON.stringify(err, null, 2)) // TODO: Change all alerts with ConfirmModal
      })
      .finally(() => {
        loading.value = false
      })
  })

  return (
    <div>
      <h3 className="text-lg font-bold text-white">
        Busca por código de barras (EAN)
      </h3>

      <div className="w-full text-center">
        <div
          className={`loading loading-lg transition-all ${
            loading.value ? 'h-80' : 'h-0'
          }`}
        />
      </div>

      {food.value && (
        <div className="mt-3 flex flex-col">
          <div className="flex">
            <div className="flex-1">
              <p className="font-bold">{food.value.name}</p>
              <p className="text-sm">
                <FoodItemView
                  foodItem={computed(() =>
                    createFoodItem({
                      name: food.value?.name ?? 'food == null',
                      reference: food.value?.id ?? 0,
                      quantity: 100,
                      macros: {
                        ...(food.value?.macros ??
                          createFoodItem({
                            name: food.value?.name ?? 'food == null',
                            reference: food.value?.id ?? 0,
                          }).macros),
                      } satisfies MacroNutrients,
                    }),
                  )}
                  header={
                    <FoodItemView.Header
                      name={<FoodItemView.Header.Name />}
                      favorite={
                        <FoodItemView.Header.Favorite
                          favorite={isFoodFavorite(food.value.id)}
                          onSetFavorite={(favorite) => {
                            if (food.value?.id === null) {
                              alert('food.value?.id === null')
                              console.error(
                                'food.value?.id === null',
                                food.value,
                              )
                              throw new Error('food.value?.id === null')
                            }
                            food.value &&
                              setFoodAsFavorite(food.value.id, favorite)
                          }}
                        />
                      }
                    />
                  }
                  nutritionalInfo={<FoodItemView.NutritionalInfo />}
                />
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 flex">
        <input
          type="number"
          placeholder="Código de barras (Ex: 7891234567890)"
          className={`input-bordered input mt-1 flex-1 border-gray-300 bg-gray-800`}
          value={barCode.value}
          onChange={(e) => (barCode.value = e.target.value.slice(0, 13))}
        />
      </div>
    </div>
  )
}
