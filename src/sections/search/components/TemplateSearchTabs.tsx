import { type Accessor, For, type Setter } from 'solid-js'

import { type ObjectValues } from '~/legacy/utils/typeUtils'
import { cn } from '~/shared/cn'

type TabDefinition = {
  id: string
  title: string
}

export const availableTabs = {
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
    title: 'Receitas',
  } as const satisfies TabDefinition,
} as const satisfies Record<string, TabDefinition>

export type AvailableTab = ObjectValues<typeof availableTabs>['id']

export function TemplateSearchTabs(props: {
  tab: Accessor<AvailableTab>
  setTab: Setter<AvailableTab>
}) {
  return (
    <ul class="flex text-sm font-medium text-center text-gray-500 divide-x divide-gray-700 rounded-lg shadow  dark:divide-gray-700 dark:text-gray-400">
      <For each={Object.keys(availableTabs)}>
        {(tabKey) => (
          <li class="w-full">
            <a
              href="#"
              class={cn(
                'flex min-h-full items-center justify-center px-4 py-2 text-sm font-medium first:ml-0 disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500 focus:outline-hidden hover:scale-110 transition-transform bg-gray-800 dark:bg-gray-800',
                {
                  'text-gray-100 bg-gray-600 dark:bg-gray-600 dark:text-gray-300':
                    props.tab() ===
                    availableTabs[tabKey as keyof typeof availableTabs].id,
                },
              )}
              aria-current="page"
              onClick={() => {
                props.setTab(
                  availableTabs[tabKey as keyof typeof availableTabs].id,
                )
              }}
            >
              {availableTabs[tabKey as keyof typeof availableTabs].title}
            </a>
          </li>
        )}
      </For>
    </ul>
  )
}
