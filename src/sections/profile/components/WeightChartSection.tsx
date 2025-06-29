import { Suspense } from 'solid-js'

import { PageLoading } from '~/sections/common/components/PageLoading'
import { lazyImport } from '~/shared/solid/lazyImport'

const { WeightEvolution } = lazyImport(
  () => import('~/sections/weight/components/WeightEvolution'),
  ['WeightEvolution'],
)

/**
 * Weight chart section wrapper for tabbed interface.
 * Provides lazy loading and suspense for weight evolution chart.
 * @returns SolidJS component
 */
export function WeightChartSection() {
  return (
    <Suspense
      fallback={<PageLoading message="Carregando evolução de peso..." />}
    >
      <WeightEvolution />
    </Suspense>
  )
}
