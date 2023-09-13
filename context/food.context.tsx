import { Food } from '@/model/foodModel'
import { Loadable, UnboxedLoadable, unboxLoadingObject } from '@/utils/loadable'
import { useCallback, useEffect, useState } from 'react'
import { createContext, useContext } from 'use-context-selector'

export type FoodStore = {
  foods: Food[]
  favoriteFoods: Food[]
  recentFoods: Food[]
}

type FoodFetch = (search?: string) => Promise<FoodStore>

export type FoodContext = UnboxedLoadable<FoodStore> & {
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
  const [foodStore, setFoodStore] = useState<Loadable<FoodStore>>({
    loading: true,
  })

  const handleFetchFoods = useCallback(
    (search?: string) => {
      onFetchFoods(search)
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
    handleFetchFoods()
  }, [handleFetchFoods])

  const context: FoodContext = {
    foods: unboxLoadingObject(foodStore, ['foods']).foods,
    favoriteFoods: unboxLoadingObject(foodStore, ['favoriteFoods'])
      .favoriteFoods,
    recentFoods: unboxLoadingObject(foodStore, ['recentFoods']).recentFoods,
    refetchFoods: handleFetchFoods,
  }

  return <FoodContext.Provider value={context}>{children}</FoodContext.Provider>
}
