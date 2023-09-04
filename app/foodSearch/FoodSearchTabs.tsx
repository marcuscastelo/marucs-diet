'use client'

import { Food } from '@/model/foodModel'
import { Tabs } from 'flowbite-react'
import { useState } from 'react'
import { Template } from './FoodSearch'
import { useUserContext } from '@/context/users.context'

export type TemplateFilter = (template: Template) => boolean

type TabDefinition<T> = {
  title: string
  // TODO: Remove filters since they are not used (backend query is used instead)
  createFilter: (params: T) => TemplateFilter
}

const avaliableTabs = {
  Todos: {
    title: 'Todos',
    createFilter: () => (template: Template) => template[''] === 'Food',
  } satisfies TabDefinition<unknown>,
  Favoritos: {
    title: 'Favoritos (Em breve)',
    createFilter: ({
      checkTemplateIsFavoriteFood,
    }: {
      checkTemplateIsFavoriteFood: TemplateFilter
    }) => checkTemplateIsFavoriteFood,
  } satisfies TabDefinition<{ checkTemplateIsFavoriteFood: TemplateFilter }>,
  Recentes: {
    title: 'Recentes (Em breve)',
    createFilter: () => (template: Template) => false,
  } satisfies TabDefinition<unknown>,
  Receitas: {
    title: 'Receitas',
    createFilter: () => (template: Template) => template[''] === 'Recipe',
  } satisfies TabDefinition<unknown>,
} as const satisfies { [key: string]: TabDefinition<any> }

export type TabName = keyof typeof avaliableTabs

export function FoodSearchTabs({
  onTabChange,
}: {
  onTabChange: (title: TabDefinition<unknown>['title']) => void
}) {
  return (
    <>
      <Tabs.Group
        aria-label="Default tabs"
        style="fullWidth"
        onActiveTabChange={(tabIndex) => {
          const tab = Object.values(avaliableTabs)[tabIndex]
          onTabChange(tab.title)
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
