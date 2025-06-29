import { createEffect, createSignal, onMount, Suspense } from 'solid-js'

import { PageLoading } from '~/sections/common/components/PageLoading'
import { BodyMeasuresChartSection } from '~/sections/profile/components/BodyMeasuresChartSection'
import { ChartSection } from '~/sections/profile/components/ChartSection'
import { MacroChartSection } from '~/sections/profile/components/MacroChartSection'
import {
  type ProfileChartTab,
  ProfileChartTabs,
} from '~/sections/profile/components/ProfileChartTabs'
import { WeightChartSection } from '~/sections/profile/components/WeightChartSection'
import { lazyImport } from '~/shared/solid/lazyImport'

const { UserInfo } = lazyImport(
  () => import('~/sections/profile/components/UserInfo'),
  ['UserInfo'],
)

function getInitialTab(): ProfileChartTab {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.slice(1)
    if (hash === 'weight' || hash === 'macros' || hash === 'measures') {
      return hash
    }
    const stored = localStorage.getItem('profile-chart-active-tab')
    if (stored === 'weight' || stored === 'macros' || stored === 'measures') {
      return stored
    }
  }
  return 'weight'
}

export default function Page() {
  const [activeTab, setActiveTab] =
    createSignal<ProfileChartTab>(getInitialTab())

  onMount(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash === 'weight' || hash === 'macros' || hash === 'measures') {
        setActiveTab(hash)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  })

  createEffect(() => {
    if (typeof window !== 'undefined' && !window.location.hash) {
      window.location.hash = activeTab()
    }
  })

  return (
    <>
      <Suspense fallback={<PageLoading message="Carregando perfil..." />}>
        <UserInfo />

        <ProfileChartTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <ChartSection id="weight" activeTab={activeTab()}>
          <WeightChartSection />
        </ChartSection>

        <ChartSection id="macros" activeTab={activeTab()}>
          <MacroChartSection />
        </ChartSection>

        <ChartSection id="measures" activeTab={activeTab()}>
          <BodyMeasuresChartSection />
        </ChartSection>
      </Suspense>
    </>
  )
}
