'use client'

import { useEffect, useState } from 'react'
import FoodItemView from './(foodItem)/FoodItemView'
import { searchFoodsByEan } from '@/controllers/food'
import { Food } from '@/model/foodModel'
import { useUserContext } from '@/context/users.context'
import { generateId } from '@/utils/idUtils'
import { createFoodItem } from '@/model/foodItemModel'
import { MacroNutrients } from '@/model/macroNutrientsModel'

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
  const [currentFood, setCurrentFood] = useState<Food | null>(null)

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
        setCurrentFood(food)
      })
      .catch((err) => {
        console.error(err)
        alert(JSON.stringify(err, null, 2))
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
  }, [innerBarCode])

  useEffect(() => {
    setBarCode?.(innerBarCode)
  }, [innerBarCode, setBarCode])

  useEffect(() => {
    setInnerBarCode(barCode)
  }, [barCode])

  useEffect(() => {
    onFoodChange?.(currentFood)
  }, [currentFood, onFoodChange])

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

      {currentFood && (
        <div className="mt-3 flex flex-col">
          <div className="flex">
            <div className="flex-1">
              <p className="font-bold">{currentFood.name}</p>
              <p className="text-sm">
                <FoodItemView
                  foodItem={createFoodItem({
                    name: currentFood.name,
                    reference: currentFood.id,
                    quantity: 100,
                    macros: {
                      ...currentFood.macros,
                    } satisfies MacroNutrients,
                  })}
                  header={
                    <FoodItemView.Header
                      name={<FoodItemView.Header.Name />}
                      favorite={
                        <FoodItemView.Header.Favorite
                          favorite={isFoodFavorite(currentFood.id)}
                          onSetFavorite={(favorite) =>
                            setFoodAsFavorite(currentFood.id, favorite)
                          }
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
