import { Suspense } from 'solid-js'

import { PageLoading } from '~/sections/common/components/PageLoading'
import { lazyImport } from '~/shared/solid/lazyImport'

const { UserInfo } = lazyImport(
  () => import('~/sections/profile/components/UserInfo'),
  ['UserInfo'],
)
const { WeightEvolution } = lazyImport(
  () => import('~/sections/weight/components/WeightEvolution'),
  ['WeightEvolution'],
)
const { MacroProfileSettings } = lazyImport(
  () => import('~/sections/profile/components/MacroProfile'),
  ['MacroProfileSettings'],
)
const { LazyMacroEvolution } = lazyImport(
  () => import('~/sections/profile/components/LazyMacroEvolution'),
  ['LazyMacroEvolution'],
)
const { LazyBodyMeasuresEvolution } = lazyImport(
  () =>
    import('~/sections/profile/measure/components/LazyBodyMeasuresEvolution'),
  ['LazyBodyMeasuresEvolution'],
)

export default function Page() {
  return (
    <>
      <Suspense fallback={<PageLoading message="Carregando perfil..." />}>
        <UserInfo />
        <WeightEvolution />
        <MacroProfileSettings />
        <Suspense
          fallback={
            <PageLoading message="Carregando gráficos de evolução..." />
          }
        >
          <LazyMacroEvolution />
          <LazyBodyMeasuresEvolution />
        </Suspense>
      </Suspense>
    </>
  )
}
