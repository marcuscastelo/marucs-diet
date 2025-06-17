import { createEffect, createSignal, onCleanup, Show } from 'solid-js'

import { ChartLoadingPlaceholder } from '~/sections/common/components/ChartLoadingPlaceholder'
import { BodyMeasuresEvolution } from '~/sections/profile/measure/components/BodyMeasuresEvolution'
import { useIntersectionObserver } from '~/shared/hooks/useIntersectionObserver'

/**
 * Lazy loading wrapper for BodyMeasuresEvolution component.
 * Loads the chart only when it becomes visible in the viewport.
 * @returns SolidJS component
 */
export function LazyBodyMeasuresEvolution() {
  const [shouldLoad, setShouldLoad] = createSignal(false)

  const { isVisible, setRef } = useIntersectionObserver()

  createEffect(() => {
    if (isVisible()) {
      setShouldLoad(true)
    }
  })
  return (
    <div ref={setRef}>
      <Show
        when={shouldLoad()}
        fallback={
          <ChartLoadingPlaceholder
            title="Progresso das medidas"
            height={600}
            message="Aguardando carregamento do gráfico..."
          />
        }
      >
        <BodyMeasuresEvolution />
      </Show>
    </div>
  )
}
