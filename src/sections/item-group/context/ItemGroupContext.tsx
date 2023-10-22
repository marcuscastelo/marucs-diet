'use client'

import { Loadable } from '@/src/legacy/utils/loadable'
import { Day } from '@/src/modules/diet/day/domain/day'
import { ItemGroup } from '@/src/modules/diet/item-group/domain/itemGroup'
import { ItemGroupRepository } from '@/src/modules/diet/item-group/domain/itemGroupRepository'
import { Meal } from '@/src/modules/diet/meal/domain/meal'
import { ReadonlySignal } from '@preact/signals-react'
import { useState } from 'react'
import { createContext, useContext } from 'use-context-selector'

export type ItemGroupContextProps = {
  groups: Loadable<readonly ItemGroup[]>
  refetchItemGroups: (dayId: Day['id'], mealId: Meal['id']) => void
  insertItemGroup: (
    dayId: Day['id'],
    mealId: Meal['id'],
    itemGroup: ItemGroup,
  ) => void
  updateItemGroup: (
    dayId: Day['id'],
    mealId: Meal['id'],
    itemGroupId: ItemGroup['id'],
    newItemGroup: ItemGroup,
  ) => void
  deleteItemGroup: (
    dayId: Day['id'],
    mealId: Meal['id'],
    itemGroupId: ItemGroup['id'],
  ) => void
}

const ItemGroupContext = createContext<ItemGroupContextProps | null>(null)

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
  children,
  repository,
}: {
  children: React.ReactNode
  repository: ReadonlySignal<ItemGroupRepository | null>
}) {
  console.debug(`[ItemGroupContextProvider] - Rendering`)

  const [items, setItems] = useState<Loadable<readonly ItemGroup[]>>({
    loading: true,
  })

  const handleFetchItemGroups = (dayId: Day['id'], mealId: Meal['id']) => {
    repository.value
      ?.fetchMealItemGroups(dayId, mealId)
      .then((items) => {
        setItems({ loading: false, errored: false, data: items })
      })
      .catch((error) => {
        setItems({ loading: false, errored: true, error })
      })
  }

  const handleInsertItemGroup = (
    dayId: Day['id'],
    mealId: Meal['id'],
    itemGroup: ItemGroup,
  ) => {
    repository.value
      ?.insertItemGroup(dayId, mealId, itemGroup)
      .then(() => handleFetchItemGroups(dayId, mealId))
  }

  const handleUpdateItemGroup = (
    dayId: Day['id'],
    mealId: Meal['id'],
    itemGroupId: ItemGroup['id'],
    newItemGroup: ItemGroup,
  ) => {
    repository.value
      ?.updateItemGroup(dayId, mealId, itemGroupId, newItemGroup)
      .then(() => handleFetchItemGroups(dayId, mealId))
  }

  const handleDeleteItemGroup = (
    dayId: Day['id'],
    mealId: Meal['id'],
    itemGroupId: ItemGroup['id'],
  ) => {
    repository.value
      ?.deleteItemGroup(dayId, mealId, itemGroupId)
      .then(() => handleFetchItemGroups(dayId, mealId))
  }

  return (
    <ItemGroupContext.Provider
      value={{
        groups: items,
        refetchItemGroups: handleFetchItemGroups,
        insertItemGroup: handleInsertItemGroup,
        updateItemGroup: handleUpdateItemGroup,
        deleteItemGroup: handleDeleteItemGroup,
      }}
    >
      {children}
    </ItemGroupContext.Provider>
  )
}
