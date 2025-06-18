import { createEffect, createSignal, Show } from 'solid-js'

import { ChartLoadingPlaceholder } from '~/sections/common/components/ChartLoadingPlaceholder'
import { MacroEvolution } from '~/sections/profile/components/MacroEvolution'
import { useIntersectionObserver } from '~/shared/hooks/useIntersectionObserver'

/**
 * Lazy loading wrapper for MacroEvolution component.
 * Loads the chart only when it becomes visible in the viewport.
 * @returns SolidJS component
 */
export function LazyMacroEvolution() {
  const [shouldLoad, setShouldLoad] = createSignal(false)

  const { isVisible, setRef } = useIntersectionObserver()

  createEffect(() => {
    console.debug('LazyMacroEvolution: Checking visibility:   ', isVisible())
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
            title="Evolução de Macronutrientes"
            height={600}
            message="Aguardando carregamento do gráfico..."
          />
        }
      >
        <MacroEvolution />
      </Show>
    </div>
  )
}
