import { createMemo, Suspense } from 'solid-js'

import { PageLoading } from '~/sections/common/components/PageLoading'
import { BodyMeasuresChartSection } from '~/sections/profile/components/BodyMeasuresChartSection'
import { ChartSection } from '~/sections/profile/components/ChartSection'
import { MacroChartSection } from '~/sections/profile/components/MacroChartSection'
import {
  type ProfileChartTab,
  ProfileChartTabs,
} from '~/sections/profile/components/ProfileChartTabs'
import { WeightChartSection } from '~/sections/profile/components/WeightChartSection'
import { useHashTabs } from '~/shared/hooks/useHashTabs'
import { lazyImport } from '~/shared/solid/lazyImport'

const { UserInfo } = lazyImport(
  () => import('~/sections/profile/components/UserInfo'),
  ['UserInfo'],
)

export default function Page() {
  const [activeTab, setActiveTab] = useHashTabs<ProfileChartTab>({
    validTabs: ['weight', 'macros', 'measures'] as const,
    defaultTab: 'weight',
    storageKey: 'profile-chart-active-tab',
  })

  // Memoize heavy components to prevent Datepicker recreation on tab changes
  // These will only recreate if their internal dependencies change, not on every tab switch
  const weightSection = createMemo(() => <WeightChartSection />)
  const macroSection = createMemo(() => <MacroChartSection />)
  const measuresSection = createMemo(() => <BodyMeasuresChartSection />)

  return (
    <>
      <Suspense fallback={<PageLoading message="Carregando perfil..." />}>
        <UserInfo />

        <ProfileChartTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <ChartSection id="weight" activeTab={activeTab()}>
          {weightSection()}
        </ChartSection>

        <ChartSection id="macros" activeTab={activeTab()}>
          {macroSection()}
        </ChartSection>

        <ChartSection id="measures" activeTab={activeTab()}>
          {measuresSection()}
        </ChartSection>
      </Suspense>
    </>
  )
}
