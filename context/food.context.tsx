import { Food } from '@/model/foodModel'
import { Loadable } from '@/utils/loadable'
import { useCallback, useEffect, useState } from 'react'
import { createContext, useContext } from 'use-context-selector'

export type FoodContext = {
  foods: Loadable<Food[]>
  refetchFoods: (search?: string) => void
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
  onFetchFoods: (search?: string) => Promise<Food[]>
  children: React.ReactNode
}) {
  const [foods, setFoods] = useState<Loadable<Food[]>>({ loading: true })

  // TODO: fetch favorite foods and store them locally to switch between tabs
  const handleFetchFoods = useCallback(
    (search?: string) => {
      onFetchFoods(search)
        .then((foods) => {
          setFoods({ loading: false, errored: false, data: foods })
        })
        .catch((error) => {
          setFoods({ loading: false, errored: true, error })
        })
    },
    [onFetchFoods],
  )

  useEffect(() => {
    handleFetchFoods()
  }, [handleFetchFoods])

  const context: FoodContext = {
    foods,
    refetchFoods: handleFetchFoods,
  }

  return <FoodContext.Provider value={context}>{children}</FoodContext.Provider>
}
