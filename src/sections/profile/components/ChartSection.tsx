import { createEffect, createSignal, type JSX, onCleanup, Show } from 'solid-js'

import { type ProfileChartTab } from '~/sections/profile/components/ProfileChartTabs'

type ChartSectionProps = {
  id: ProfileChartTab
  activeTab: ProfileChartTab
  children: JSX.Element
}

/**
 * Chart cleanup utilities for memory management.
 */
function cleanupChartResources() {
  // Force garbage collection if available (development only)
  if (
    typeof window !== 'undefined' &&
    'gc' in window &&
    process.env.NODE_ENV === 'development'
  ) {
    const windowWithGc = window as { gc?: () => void }
    if (typeof windowWithGc.gc === 'function') {
      windowWithGc.gc()
    }
  }

  // Light cleanup - just trigger garbage collection
  // Let solid-apexcharts handle its own chart instances
  console.debug('[ChartSection] Light cleanup performed')
}

/**
 * Conditional rendering wrapper for chart sections.
 * Only renders children when the section is active, enabling memory optimization.
 * Includes automatic cleanup when tabs are switched.
 * @param props - Section configuration and children
 * @returns SolidJS component
 */
export function ChartSection(props: ChartSectionProps) {
  const [wasActive, setWasActive] = createSignal(false)

  createEffect(() => {
    const isActive = props.activeTab === props.id

    if (wasActive() && !isActive) {
      // Tab was active but now isn't - cleanup resources
      setTimeout(() => {
        cleanupChartResources()
        console.debug(
          `[ChartSection] Cleaned up resources for tab: ${props.id}`,
        )
      }, 100) // Small delay to ensure DOM cleanup
    }

    setWasActive(isActive)
  })

  onCleanup(() => {
    // Component unmounting - full cleanup
    cleanupChartResources()
  })

  return <Show when={props.activeTab === props.id}>{props.children}</Show>
}
