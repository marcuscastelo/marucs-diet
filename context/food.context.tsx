import { Food } from '@/model/foodModel'
import { Loadable } from '@/utils/loadable'
import { useEffect, useState } from 'react'
import { createContext, useContext } from 'use-context-selector'

export type FoodContext = {
  foods: Loadable<Food[]>
  refetchFoods: (search?: string) => Promise<Food[]>
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

  useEffect(() => {
    let ignore = false
    onFetchFoods()
      .then((foods) => {
        if (ignore) {
          return
        }
        setFoods({ loading: false, errored: false, data: foods })
      })
      .catch((error) => {
        if (ignore) {
          return
        }
        setFoods({ loading: false, errored: true, error })
      })
    return () => {
      ignore = true
    }
  }, [onFetchFoods])

  const context: FoodContext = {
    foods,
    refetchFoods: onFetchFoods,
  }

  return <FoodContext.Provider value={context}>{children}</FoodContext.Provider>
}
