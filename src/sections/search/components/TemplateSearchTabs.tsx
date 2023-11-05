import { type ObjectValues } from '@/legacy/utils/typeUtils'
import { type Accessor, For, type Setter } from 'solid-js'
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

export function TemplateSearchTabs (props: {
  tab: Accessor<AvailableTab>
  setTab: Setter<AvailableTab>
}) {
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
                    'text-gray-100 bg-gray-600 dark:bg-gray-700 dark:text-gray-300': props.tab() === avaliableTabs[tabKey as keyof typeof avaliableTabs].id
                  })
              }
              aria-current="page"
              onClick={() => {
                props.setTab(avaliableTabs[tabKey as keyof typeof avaliableTabs].id)
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
