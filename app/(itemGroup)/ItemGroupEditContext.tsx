'use client'

import { ItemGroup } from '@/model/foodItemGroupModel'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'

import { createContext, useContext } from 'use-context-selector'

const ItemGroupEditContext = createContext<{
  group: ItemGroup | null
  setGroup: Dispatch<SetStateAction<ItemGroup | null>>
  saveGroup: () => void
} | null>(null)

export function useItemGroupEditContext() {
  const context = useContext(ItemGroupEditContext)

  if (!context) {
    throw new Error(
      'useItemGroupContext must be used within a ItemGroupContextProvider',
    )
  }

  return context
}

export function ItemGroupEditContextProvider({
  group: initialGroup,
  onSaveGroup,
  children,
}: {
  group: ItemGroup | null
  onSaveGroup: (group: ItemGroup) => void
  children: ReactNode
}) {
  const [group, setGroup] = useState<ItemGroup | null>(initialGroup)

  const handleSaveGroup = () => group && onSaveGroup(group)

  useEffect(() => {
    setGroup(initialGroup)
  }, [initialGroup])

  return (
    <ItemGroupEditContext.Provider
      value={{ group, setGroup, saveGroup: handleSaveGroup }}
    >
      {children}
    </ItemGroupEditContext.Provider>
  )
}
