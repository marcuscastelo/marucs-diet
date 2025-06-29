import { type JSX, Show } from 'solid-js'

import { type ProfileChartTab } from '~/sections/profile/components/ProfileChartTabs'

type ChartSectionProps = {
  id: ProfileChartTab
  activeTab: ProfileChartTab
  children: JSX.Element
}

/**
 * Conditional rendering wrapper for chart sections.
 * Only renders children when the section is active, enabling memory optimization.
 * @param props - Section configuration and children
 * @returns SolidJS component
 */
export function ChartSection(props: ChartSectionProps) {
  return <Show when={props.activeTab === props.id}>{props.children}</Show>
}
