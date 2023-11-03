import { type ObjectValues } from '@/legacy/utils/typeUtils'
import { type Loadable } from '@/legacy/utils/loadable'
import { type TemplateStore } from '@/sections/template/context/TemplateContext'
import { type Template } from '@/modules/diet/template/domain/template'
import { For, createSignal } from 'solid-js'
import { cn } from '@/legacy/utils/cn'

type TabDefinition = {
  id: string
  title: string
}

export const avaliableTabs = {
  Todos: {
    id: 'all',
    title: 'Todos'
  } as const satisfies TabDefinition,
  Favoritos: {
    id: 'favorites',
    title: 'Favoritos'
  } as const satisfies TabDefinition,
  Recentes: {
    id: 'recent',
    title: 'Recentes'
  } as const satisfies TabDefinition,
  Receitas: {
    id: 'recipes',
    title: 'Receitas (WIP)'
  } as const satisfies TabDefinition
} as const satisfies Record<string, TabDefinition>

export type AvailableTab = ObjectValues<typeof avaliableTabs>['id']

export function chooseFoodsFromStore (
  tab: AvailableTab,
  store: Record<keyof TemplateStore, Loadable<readonly Template[] | null>>
): Loadable<readonly Template[] | null> {
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
      return { loading: false, errored: true, error: new Error('Invalid tab') }
  }
}

export function TemplateSearchTabs (props: {
  onTabChange: (
    id: (typeof avaliableTabs)[keyof typeof avaliableTabs]['id'],
  ) => void
}) {
  // TODO: (TemplateSearchTabs) Remove internal state and use props instead
  const [selectedTab, setSelectedTab] = createSignal<AvailableTab>('all')

  return (
    <ul class="flex text-sm font-medium text-center text-gray-500 divide-x divide-gray-700 rounded-lg shadow  dark:divide-gray-700 dark:text-gray-400">
      <For each={Object.keys(avaliableTabs)}>
        {(tabKey) => (
          <li class="w-full">
            <a
              href="#"
              class={
                cn('flex min-h-full items-center justify-center p-4 text-sm font-medium first:ml-0 disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500 focus:outline-none',
                  {
                    'text-gray-100 bg-gray-600 dark:bg-gray-700 dark:text-gray-300': selectedTab() === avaliableTabs[tabKey as keyof typeof avaliableTabs].id
                  })
              }
              aria-current="page"
              onClick={() => {
                setSelectedTab(avaliableTabs[tabKey as keyof typeof avaliableTabs].id)
                props.onTabChange(avaliableTabs[tabKey as keyof typeof avaliableTabs].id)
              }}
            >
              {avaliableTabs[tabKey as keyof typeof avaliableTabs].title}
            </a>
          </li>
        )}
      </For>
    </ul>
  )
}
