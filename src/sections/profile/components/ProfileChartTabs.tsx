import { type Accessor, createEffect, For, type Setter } from 'solid-js'

import { cn } from '~/shared/cn'
import { type ObjectValues } from '~/shared/utils/typeUtils'

type TabDefinition = {
  id: string
  title: string
}

export const availableChartTabs = {
  Weight: {
    id: 'weight',
    title: 'Peso',
  } as const satisfies TabDefinition,
  Macros: {
    id: 'macros',
    title: 'Macronutrientes',
  } as const satisfies TabDefinition,
  Measures: {
    id: 'measures',
    title: 'Medidas Corporais',
  } as const satisfies TabDefinition,
} as const satisfies Record<string, TabDefinition>

export type ProfileChartTab = ObjectValues<typeof availableChartTabs>['id']

type ProfileChartTabsProps = {
  activeTab: Accessor<ProfileChartTab>
  setActiveTab: Setter<ProfileChartTab>
}

/**
 * Tab navigation component for profile charts.
 * Provides tabs for Weight, Macros, and Body Measures sections.
 * @param props - Tab state management props
 * @returns SolidJS component
 */
export function ProfileChartTabs(props: ProfileChartTabsProps) {
  const tabKeys = Object.keys(availableChartTabs)

  createEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profile-chart-active-tab', props.activeTab())
    }
  })

  return (
    <div class="mb-6">
      <ul class="flex text-font-medium text-center text-gray-500 divide-x divide-gray-600 rounded-lg shadow dark:divide-gray-600 dark:text-gray-300 bg-gray-900 dark:bg-gray-900">
        <For each={tabKeys}>
          {(tabKey, i) => {
            const tabId = () =>
              availableChartTabs[tabKey as keyof typeof availableChartTabs].id
            const tabTitle = () =>
              availableChartTabs[tabKey as keyof typeof availableChartTabs]
                .title
            const isActive = () => props.activeTab() === tabId()

            return (
              <li class="w-full">
                <button
                  type="button"
                  class={cn(
                    'flex min-h-full items-center justify-center px-4 py-3 text-sm font-medium first:ml-0 disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500 focus:outline-hidden hover:scale-105 transition-transform bg-gray-900 dark:bg-gray-900 gap-2 w-full',
                    {
                      'text-white bg-blue-700 dark:bg-blue-800 border-b-4 border-blue-400':
                        isActive(),
                      'rounded-tl-lg': i() === 0,
                      'rounded-tr-lg': i() === tabKeys.length - 1,
                    },
                  )}
                  aria-current={isActive() ? 'page' : undefined}
                  onClick={() => {
                    props.setActiveTab(tabId())
                    if (typeof window !== 'undefined') {
                      window.location.hash = tabId()
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      props.setActiveTab(tabId())
                      if (typeof window !== 'undefined') {
                        window.location.hash = tabId()
                      }
                    }
                    if (event.key === 'ArrowLeft' && i() > 0) {
                      event.preventDefault()
                      const prevTab = tabKeys[i() - 1]
                      const prevTabId =
                        availableChartTabs[
                          prevTab as keyof typeof availableChartTabs
                        ].id
                      props.setActiveTab(prevTabId)
                      if (typeof window !== 'undefined') {
                        window.location.hash = prevTabId
                      }
                    }
                    if (
                      event.key === 'ArrowRight' &&
                      i() < tabKeys.length - 1
                    ) {
                      event.preventDefault()
                      const nextTab = tabKeys[i() + 1]
                      const nextTabId =
                        availableChartTabs[
                          nextTab as keyof typeof availableChartTabs
                        ].id
                      props.setActiveTab(nextTabId)
                      if (typeof window !== 'undefined') {
                        window.location.hash = nextTabId
                      }
                    }
                  }}
                >
                  {tabTitle()}
                </button>
              </li>
            )
          }}
        </For>
      </ul>
    </div>
  )
}
