'use client'

import { ItemGroup } from '@/model/itemGroupModel'
import { ReadonlySignal, Signal, useSignal } from '@preact/signals-react'
import { ReactNode, useEffect, useState } from 'react'

import { createContext, useContext } from 'use-context-selector'

const ItemGroupEditContext = createContext<{
  group: Signal<ItemGroup | null>
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
  group: ReadonlySignal<ItemGroup | null>
  onSaveGroup: (group: ItemGroup) => void
  children: ReactNode
}) {
  const group = useSignal<ItemGroup | null>(initialGroup.value)

  const handleSaveGroup = () => group.value && onSaveGroup(group.value)

  return (
    <ItemGroupEditContext.Provider
      value={{ group, saveGroup: handleSaveGroup }}
    >
      {children}
    </ItemGroupEditContext.Provider>
  )
}
