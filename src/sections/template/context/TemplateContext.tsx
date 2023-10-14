import { Food } from '@/legacy/model/foodModel'
import { Recipe } from '@/legacy/model/recipeModel'
import {
  Loadable,
  UnboxedLoadable,
  unboxLoadingObject,
} from '@/legacy/utils/loadable'
import { useCallback, useEffect, useState } from 'react'
import { createContext, useContext } from 'use-context-selector'

export type TemplateStore = {
  foods: Food[] | null
  favoriteFoods: Food[] | null
  recentFoods: Food[] | null
  recipes: Recipe[] | null
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
  const [foodStore, setFoodStore] = useState<Loadable<TemplateStore>>({
    loading: true,
  })

  const handleFetchFoods = useCallback<
    (...params: Parameters<FoodFetch>) => void
  >(
    (selectedTypes, search) => {
      onFetchFoods(selectedTypes, search)
        .then((foodStore) => {
          setFoodStore({ loading: false, errored: false, data: foodStore })
        })
        .catch((error) => {
          setFoodStore({ loading: false, errored: true, error })
        })
    },
    [onFetchFoods],
  )

  useEffect(() => {
    handleFetchFoods('all')
  }, [handleFetchFoods])

  const context: FoodContext = {
    foods: unboxLoadingObject(foodStore, ['foods']).foods,
    favoriteFoods: unboxLoadingObject(foodStore, ['favoriteFoods'])
      .favoriteFoods,
    recentFoods: unboxLoadingObject(foodStore, ['recentFoods']).recentFoods,
    recipes: unboxLoadingObject(foodStore, ['recipes']).recipes,
    refetchFoods: handleFetchFoods,
  }

  return <FoodContext.Provider value={context}>{children}</FoodContext.Provider>
}
