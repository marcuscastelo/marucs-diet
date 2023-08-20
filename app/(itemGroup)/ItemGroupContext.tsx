'use client'

import { ItemGroup } from '@/model/foodItemGroupModel'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'

import { createContext, useContext } from 'use-context-selector'

const ItemGroupContext = createContext<{
  itemGroup: ItemGroup | null
  setItemGroup: Dispatch<SetStateAction<ItemGroup | null>>
} | null>(null)

export function useItemGroupContext() {
  const context = useContext(ItemGroupContext)

  if (!context) {
    throw new Error(
      'useItemGroupContext must be used within a ItemGroupContextProvider',
    )
  }

  return context
}

export function ItemGroupContextProvider({
  itemGroup: initialItemGroup,
  children,
}: {
  itemGroup: ItemGroup | null
  children: ReactNode
}) {
  const [foodItemGroup, setItemGroup] = useState<ItemGroup | null>(
    initialItemGroup,
  )

  useEffect(() => {
    setItemGroup(initialItemGroup)
  }, [initialItemGroup])

  return (
    <ItemGroupContext.Provider
      value={{ itemGroup: foodItemGroup, setItemGroup }}
    >
      {children}
    </ItemGroupContext.Provider>
  )
}
