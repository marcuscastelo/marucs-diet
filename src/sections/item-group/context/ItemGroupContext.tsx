'use client'

import { Loadable } from '@/src/legacy/utils/loadable'
import { DayDiet } from '@/src/modules/diet/day-diet/domain/dayDiet'
import { ItemGroup } from '@/src/modules/diet/item-group/domain/itemGroup'
import { ItemGroupRepository } from '@/src/modules/diet/item-group/domain/itemGroupRepository'
import { Meal } from '@/src/modules/diet/meal/domain/meal'
import { ReadonlySignal, useSignal } from '@preact/signals-react'
import { createContext, useContext } from 'use-context-selector'

export type ItemGroupContextProps = {
  groups: ReadonlySignal<Loadable<readonly ItemGroup[]>>
  refetchItemGroups: (dayId: DayDiet['id'], mealId: Meal['id']) => void
  insertItemGroup: (
    dayId: DayDiet['id'],
    mealId: Meal['id'],
    itemGroup: ItemGroup,
  ) => void
  updateItemGroup: (
    dayId: DayDiet['id'],
    mealId: Meal['id'],
    itemGroupId: ItemGroup['id'],
    newItemGroup: ItemGroup,
  ) => void
  deleteItemGroup: (
    dayId: DayDiet['id'],
    mealId: Meal['id'],
    itemGroupId: ItemGroup['id'],
  ) => void
}

const ItemGroupContext = createContext<ItemGroupContextProps | null>(null)

/**
 * @deprecated Should be replaced by use cases
 */
export function useItemGroupContext() {
  const context = useContext(ItemGroupContext)

  if (!context) {
    throw new Error(
      'useItemGroupContext must be used within a ItemGroupContextProvider',
    )
  }

  return context
}

/**
 * @deprecated Should be replaced by use cases
 */
export function ItemGroupContextProvider({
  children,
  repository,
}: {
  children: React.ReactNode
  repository: ReadonlySignal<ItemGroupRepository | null>
}) {
  console.debug(`[ItemGroupContextProvider] - Rendering`)

  const items = useSignal<Loadable<readonly ItemGroup[]>>({
    loading: true,
  })

  const handleFetchItemGroups = (dayId: DayDiet['id'], mealId: Meal['id']) => {
    repository.value
      ?.fetchMealItemGroups(dayId, mealId)
      .then((foundItems) => {
        items.value = { loading: false, errored: false, data: foundItems }
      })
      .catch((error) => {
        items.value = { loading: false, errored: true, error }
      })
  }

  const handleInsertItemGroup = (
    dayId: DayDiet['id'],
    mealId: Meal['id'],
    itemGroup: ItemGroup,
  ) => {
    repository.value
      ?.insertItemGroup(dayId, mealId, itemGroup)
      .then(() => handleFetchItemGroups(dayId, mealId))
  }

  const handleUpdateItemGroup = (
    dayId: DayDiet['id'],
    mealId: Meal['id'],
    itemGroupId: ItemGroup['id'],
    newItemGroup: ItemGroup,
  ) => {
    repository.value
      ?.updateItemGroup(dayId, mealId, itemGroupId, newItemGroup)
      .then(() => handleFetchItemGroups(dayId, mealId))
  }

  const handleDeleteItemGroup = (
    dayId: DayDiet['id'],
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
