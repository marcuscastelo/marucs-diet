'use client'

import { FoodItemGroup } from '@/model/foodItemGroupModel'
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const FoodItemGroupContext = createContext<{
  foodItemGroup: FoodItemGroup | null
  setFoodItemGroup: Dispatch<SetStateAction<FoodItemGroup | null>>
} | null>(null)

export function useFoodItemGroupContext() {
  const context = useContext(FoodItemGroupContext)

  if (!context) {
    throw new Error(
      'useMealItemContext must be used within a MealItemContextProvider',
    )
  }

  return context
}

export function FoodItemGroupContextProvider({
  foodItemGroup: initialFoodItemGroup,
  children,
}: {
  foodItemGroup: FoodItemGroup | null
  children: ReactNode
}) {
  const [foodItemGroup, setFoodItemGroup] = useState<FoodItemGroup | null>(
    initialFoodItemGroup,
  )

  useEffect(() => {
    setFoodItemGroup(initialFoodItemGroup)
  }, [initialFoodItemGroup])

  return (
    <FoodItemGroupContext.Provider value={{ foodItemGroup, setFoodItemGroup }}>
      {children}
    </FoodItemGroupContext.Provider>
  )
}
