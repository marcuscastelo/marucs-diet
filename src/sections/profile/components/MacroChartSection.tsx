import { Suspense } from 'solid-js'

import { PageLoading } from '~/sections/common/components/PageLoading'
import { lazyImport } from '~/shared/solid/lazyImport'

const { MacroProfileSettings } = lazyImport(
  () => import('~/sections/profile/components/MacroProfile'),
  ['MacroProfileSettings'],
)
const { LazyMacroEvolution } = lazyImport(
  () => import('~/sections/profile/components/LazyMacroEvolution'),
  ['LazyMacroEvolution'],
)

/**
 * Macro chart section wrapper for tabbed interface.
 * Includes both macro profile settings and evolution charts.
 * @returns SolidJS component
 */
export function MacroChartSection() {
  return (
    <>
      <Suspense
        fallback={
          <PageLoading message="Carregando perfil de macronutrientes..." />
        }
      >
        <MacroProfileSettings />
      </Suspense>
      <Suspense
        fallback={<PageLoading message="Carregando gráficos de evolução..." />}
      >
        <LazyMacroEvolution />
      </Suspense>
    </>
  )
}
