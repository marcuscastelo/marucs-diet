'use client'

import { Tabs } from 'flowbite-react'
import { ObjectValues } from '@/utils/typeUtils'
import { Loadable, UnboxedLoadable } from '@/utils/loadable'
import { TemplateStore } from '@/context/template.context'
import { Template } from '@/model/templateModel'

type TabDefinition = {
  id: string
  title: string
}

export const avaliableTabs = {
  Todos: {
    id: 'all',
    title: 'Todos',
  } as const satisfies TabDefinition,
  Favoritos: {
    id: 'favorites',
    title: 'Favoritos',
  } as const satisfies TabDefinition,
  Recentes: {
    id: 'recent',
    title: 'Recentes',
  } as const satisfies TabDefinition,
  Receitas: {
    id: 'recipes',
    title: 'Receitas (WIP)',
  } as const satisfies TabDefinition,
} as const satisfies { [key: string]: TabDefinition }

export type AvailableTab = ObjectValues<typeof avaliableTabs>['id']

export function chooseFoodsFromStore(
  tab: AvailableTab,
  store: UnboxedLoadable<TemplateStore>,
): Loadable<Template[] | null> {
  switch (tab) {
    case 'all':
      return store.foods
    case 'favorites':
      return store.favoriteFoods
    case 'recent':
      return store.recentFoods
    case 'recipes':
      return store.recipes
    default:
      tab satisfies never
      throw new Error(`Invalid tab: ${tab}`)
  }
}

export function TemplateSearchTabs({
  onTabChange,
}: {
  onTabChange: (
    id: (typeof avaliableTabs)[keyof typeof avaliableTabs]['id'],
  ) => void
}) {
  return (
    <>
      <Tabs.Group
        aria-label="Default tabs"
        style="fullWidth"
        onActiveTabChange={(tabIndex) => {
          const tab = Object.values(avaliableTabs)[tabIndex]
          onTabChange(tab.id)
        }}
        theme={{
          tablist: {
            tabitem: {
              base: 'flex items-center justify-center p-4 rounded-t-lg text-sm font-medium first:ml-0 disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500 focus:outline-none',
            },
          },
        }}
      >
        {Object.values(avaliableTabs).map((tab, idx) => (
          <Tabs.Item key={idx} title={tab.title} />
        ))}
      </Tabs.Group>
    </>
  )
}
