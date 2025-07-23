import { Suspense } from 'solid-js'

import { PageLoading } from '~/sections/common/components/PageLoading'
import { lazyImport } from '~/shared/solid/lazyImport'

const { BodyMeasuresEvolution } = lazyImport(
  () => import('~/sections/profile/measure/components/BodyMeasuresEvolution'),
  ['BodyMeasuresEvolution'],
)

/**
 * Body measures chart section wrapper for tabbed interface.
 * Provides lazy loading and suspense for body measures evolution chart.
 * @returns SolidJS component
 */
export function BodyMeasuresChartSection() {
  return (
    <Suspense
      fallback={<PageLoading message="Carregando progresso das medidas..." />}
    >
      <BodyMeasuresEvolution />
    </Suspense>
  )
}
