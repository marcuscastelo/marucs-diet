import { Food } from '@/modules/diet/food/domain/food'
import { Recipe } from '@/src/modules/diet/recipe/domain/recipe'
import {
  Loadable,
  UnboxedLoadable,
  unboxLoadingObject,
} from '@/legacy/utils/loadable'
import { useCallback, useEffect, useState } from 'react'
import { createContext, useContext } from 'use-context-selector'
import { useSignal } from '@preact/signals-react'

export type TemplateStore = {
  foods: readonly Food[] | null
  favoriteFoods: readonly Food[] | null
  recentFoods: readonly Food[] | null
  recipes: readonly Recipe[] | null
}

type FoodFetch = (
  selectedTypes: 'all' | readonly (keyof TemplateStore)[],
  search?: string,
) => Promise<TemplateStore>

export type FoodContext = UnboxedLoadable<TemplateStore> & {
  refetchFoods: (...params: Parameters<FoodFetch>) => void
}

const FoodContext = createContext<FoodContext | null>(null)

export function useFoodContext() {
  const context = useContext(FoodContext)

  if (!context) {
    throw new Error('useFoodContext must be used within a FoodContextProvider')
  }

  return context
}

export function FoodContextProvider({
  onFetchFoods,
  children,
}: {
  onFetchFoods: FoodFetch
  children: React.ReactNode
}) {
  const foodStore = useSignal<Loadable<TemplateStore>>({
    loading: true,
  })

  const handleFetchFoods = useCallback<
    (...params: Parameters<FoodFetch>) => void
  >(
    (selectedTypes, search) => {
      onFetchFoods(selectedTypes, search)
        .then((newFoodStore) => {
          foodStore.value = {
            loading: false,
            errored: false,
            data: newFoodStore,
          }
        })
        .catch((error) => {
          foodStore.value = { loading: false, errored: true, error }
        })
    },
    [onFetchFoods, foodStore],
  )

  useEffect(() => {
    handleFetchFoods('all')
  }, [handleFetchFoods])

  const context: FoodContext = {
    foods: unboxLoadingObject(foodStore.value, ['foods']).foods,
    favoriteFoods: unboxLoadingObject(foodStore.value, ['favoriteFoods'])
      .favoriteFoods,
    recentFoods: unboxLoadingObject(foodStore.value, ['recentFoods'])
      .recentFoods,
    recipes: unboxLoadingObject(foodStore.value, ['recipes']).recipes,
    refetchFoods: handleFetchFoods,
  }

  return <FoodContext.Provider value={context}>{children}</FoodContext.Provider>
}
