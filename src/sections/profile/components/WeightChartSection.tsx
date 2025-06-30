import { Suspense } from 'solid-js'

import { ChartLoadingPlaceholder } from '~/sections/common/components/ChartLoadingPlaceholder'
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
      fallback={
        <ChartLoadingPlaceholder
          title="Evolução de Peso"
          height={600}
          message="Carregando gráfico de evolução..."
        />
      }
    >
      <WeightEvolution />
    </Suspense>
  )
}
