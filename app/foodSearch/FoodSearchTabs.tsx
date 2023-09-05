'use client'

import { Food } from '@/model/foodModel'
import { Tabs } from 'flowbite-react'
import { useState } from 'react'
import { Template } from './FoodSearch'
import { useUserContext } from '@/context/users.context'

export type TemplateFilter = (template: Template) => boolean

type TabDefinition<T> = {
  id: string
  title: string
  // TODO: Remove filters since they are not used (backend query is used instead)
  createFilter: (params: T) => TemplateFilter
}

export const avaliableTabs = {
  Todos: {
    id: 'all',
    title: 'Todos',
    createFilter: () => (template: Template) => template[''] === 'Food',
  } as const satisfies TabDefinition<unknown>,
  Favoritos: {
    id: 'favorites',
    title: 'Favoritos',
    createFilter: ({
      checkTemplateIsFavoriteFood,
    }: {
      checkTemplateIsFavoriteFood: TemplateFilter
    }) => checkTemplateIsFavoriteFood,
  } as const satisfies TabDefinition<{
    checkTemplateIsFavoriteFood: TemplateFilter
  }>,
  // Recentes: {
  //   id: 'recent',
  //   title: 'Recentes (Em breve)',
  //   createFilter: () => (template: Template) => false,
  // } as const satisfies TabDefinition<unknown>,
  // Receitas: {
  //   id: 'recipes',
  //   title: 'Receitas (Em breve)',
  //   createFilter: () => (template: Template) => template[''] === 'Recipe',
  // } as const satisfies TabDefinition<unknown>,
} as const satisfies { [key: string]: TabDefinition<any> }

export type TabName = keyof typeof avaliableTabs

export function FoodSearchTabs({
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
