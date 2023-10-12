'use client'

import { useEffect, useState } from 'react'
import FoodItemView from './(foodItem)/FoodItemView'
import { searchFoodsByEan } from '@/controllers/food'
import { Food } from '@/model/foodModel'
import { useUserContext } from '@/context/users.context'
import { createFoodItem } from '@/model/foodItemModel'
import { MacroNutrients } from '@/model/macroNutrientsModel'
import { computed, useSignal, useSignalEffect } from '@preact/signals-react'
import { mockItem } from './test/unit/(mock)/mockData'

export type BarCodeSearchProps = {
  barCode?: string
  setBarCode?: (barCode: string) => void
  onFoodChange?: (food: Food | null) => void
}

export default function BarCodeSearch({
  barCode = '',
  setBarCode,
  onFoodChange,
}: BarCodeSearchProps) {
  const [loading, setLoading] = useState(false)
  const [innerBarCode, setInnerBarCode] = useState(barCode)
  const currentFood = useSignal<Food | null>(null)

  const { isFoodFavorite, setFoodAsFavorite } = useUserContext()

  const EAN_LENGTH = 13

  useEffect(() => {
    if (innerBarCode.length !== EAN_LENGTH) {
      return
    }

    setLoading(true)
    let ignore = false
    searchFoodsByEan(innerBarCode)
      .then((food) => {
        if (ignore) {
          return
        }
        currentFood.value = food
      })
      .catch((err) => {
        console.error(err)
        alert(JSON.stringify(err, null, 2)) // TODO: Change all alerts with ConfirmModal
      })
      .finally(() => {
        if (ignore) {
          return
        }
        setLoading(false)
      })

    const timeout = setTimeout(() => {
      setLoading(false)
    }, 100000)

    return () => {
      clearTimeout(timeout)
      ignore = true
    }
  }, [currentFood, currentFood.value, innerBarCode])

  useEffect(() => {
    setBarCode?.(innerBarCode)
  }, [innerBarCode, setBarCode])

  useEffect(() => {
    setInnerBarCode(barCode)
  }, [barCode])

  useSignalEffect(() => {
    onFoodChange?.(currentFood.value)
  })

  return (
    <div>
      <h3 className="text-lg font-bold text-white">
        Busca por código de barras (EAN)
      </h3>

      <div className="w-full text-center">
        <div
          className={`loading loading-lg transition-all ${
            loading ? 'h-80' : 'h-0'
          }`}
        />
      </div>

      {currentFood.value && (
        <div className="mt-3 flex flex-col">
          <div className="flex">
            <div className="flex-1">
              <p className="font-bold">{currentFood.value.name}</p>
              <p className="text-sm">
                <FoodItemView
                  foodItem={computed(() =>
                    createFoodItem({
                      name: currentFood.value?.name ?? 'currentFood == null',
                      reference: currentFood.value?.id ?? 0,
                      quantity: 100,
                      macros: {
                        ...(currentFood.value?.macros ?? mockItem().macros),
                      } satisfies MacroNutrients,
                    }),
                  )}
                  header={
                    <FoodItemView.Header
                      name={<FoodItemView.Header.Name />}
                      favorite={
                        <FoodItemView.Header.Favorite
                          favorite={isFoodFavorite(currentFood.value.id)}
                          onSetFavorite={(favorite) => {
                            if (currentFood.value?.id === null) {
                              alert('currentFood.value?.id === null')
                              console.error(
                                'currentFood.value?.id === null',
                                currentFood.value,
                              )
                              throw new Error('currentFood.value?.id === null')
                            }
                            setFoodAsFavorite(
                              currentFood.value?.id ?? 0,
                              favorite,
                            )
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
          value={innerBarCode}
          onChange={(e) => setInnerBarCode(e.target.value.slice(0, 13))}
        />
      </div>
    </div>
  )
}
