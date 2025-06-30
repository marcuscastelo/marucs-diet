import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'

import { buildChartData } from '~/modules/weight/application/weightChartUtils'
import { type Weight } from '~/modules/weight/domain/weight'
import {
  calculateMovingAverage,
  groupWeightsByPeriod,
  optimizeWeightsForMobile,
} from '~/modules/weight/domain/weightEvolutionDomain'
import { buildWeightChartOptions } from '~/sections/weight/components/WeightChartOptions'
import { buildWeightChartSeries } from '~/sections/weight/components/WeightChartSeries'
import { lazyImport } from '~/shared/solid/lazyImport'

const { SolidApexCharts } = lazyImport(
  () => import('solid-apexcharts'),
  ['SolidApexCharts'],
)

/**
 * Props for the WeightChart component.
 */
export type WeightChartProps = {
  weights: readonly Weight[]
  desiredWeight: number
  type: '7d' | '14d' | '30d' | '6m' | '1y' | 'all'
}

/**
 * Detects if the device is mobile for performance optimizations.
 * @returns True if mobile device
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) || window.innerWidth < 768
  )
}

/**
 * Renders a candlestick and line chart for weight evolution.
 * @param props - WeightChartProps
 * @returns SolidJS component
 */
/**
 * Performance monitoring utilities.
 */
function measurePerformance<T>(name: string, fn: () => T): T {
  if (typeof window !== 'undefined' && Boolean(window.performance)) {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    console.debug(`[WeightChart] ${name}: ${(end - start).toFixed(2)}ms`)
    return result
  } else {
    return fn()
  }
}

/**
 * Incremental rendering phases for progressive chart loading.
 */
type RenderPhase = 'idle' | 'data-processing' | 'chart-building' | 'complete'

/**
 * Simple cache for expensive calculations.
 */
const chartDataCache = new Map<string, Weight[]>()

/**
 * Generate cache key for chart data.
 */
function generateCacheKey(
  weights: readonly Weight[],
  type: string,
  isMobile: boolean,
): string {
  const weightsHash =
    weights.length +
    (weights[0]?.id ?? 0) +
    (weights[weights.length - 1]?.id ?? 0)
  return `${weightsHash}-${type}-${isMobile}`
}

/**
 * Clear cache when it gets too large.
 */
function manageCacheSize() {
  if (chartDataCache.size > 10) {
    const firstKey = chartDataCache.keys().next().value
    if (typeof firstKey === 'string') {
      chartDataCache.delete(firstKey)
    }
  }
}

export function WeightChart(props: WeightChartProps) {
  const [isMobile, setIsMobile] = createSignal(false)
  const [renderPhase, setRenderPhase] = createSignal<RenderPhase>('idle')
  const [processedDataCount, setProcessedDataCount] = createSignal(0)
  const [chartInstance, setChartInstance] = createSignal<{
    destroy?: () => void
    updateSeries?: (series: unknown, animate?: boolean) => void
    updateOptions?: (
      options: unknown,
      redrawPaths?: boolean,
      animate?: boolean,
    ) => void
  } | null>(null)

  onMount(() => {
    setIsMobile(isMobileDevice())

    // Start incremental rendering process
    const startTime =
      typeof window !== 'undefined' && Boolean(window.performance)
        ? performance.now()
        : 0
    setRenderPhase('data-processing')

    // Use requestIdleCallback for non-blocking processing
    const processIncrementally = () => {
      if (
        typeof window !== 'undefined' &&
        Boolean(window.requestIdleCallback)
      ) {
        window.requestIdleCallback(() => {
          setRenderPhase('chart-building')
          // Small delay to allow UI to update
          setTimeout(() => {
            setRenderPhase('complete')
            const totalTime = performance.now() - startTime
            console.debug(
              `[WeightChart] Total render time: ${totalTime.toFixed(2)}ms`,
            )
          }, 50)
        })
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(
          () => {
            setRenderPhase('chart-building')
            setTimeout(() => setRenderPhase('complete'), 50)
          },
          props.weights.length > 50 ? 200 : 100,
        )
      }
    }

    processIncrementally()
  })

  // Mobile-optimized weights with caching
  const optimizedWeights = createMemo(() => {
    const cacheKey = generateCacheKey(props.weights, props.type, isMobile())

    if (chartDataCache.has(cacheKey)) {
      const cached = chartDataCache.get(cacheKey)
      if (cached) {
        setProcessedDataCount(cached.length)
        console.debug('[WeightChart] Using cached data')
        return cached
      }
    }

    return measurePerformance('Weight Optimization', () => {
      const result = optimizeWeightsForMobile(props.weights, isMobile())
      setProcessedDataCount(result.length)

      // Cache the result
      manageCacheSize()
      chartDataCache.set(cacheKey, result)
      console.debug('[WeightChart] Data cached')

      return result
    })
  })

  // Chart instance lifecycle management with updates
  createEffect(() => {
    const instance = chartInstance()
    if (instance && renderPhase() === 'complete') {
      // Debounced chart updates when data changes
      const timer = setTimeout(() => {
        try {
          const newSeries = series()
          const newOptions = options()

          if (
            typeof instance.updateSeries === 'function' &&
            typeof instance.updateOptions === 'function'
          ) {
            instance.updateOptions(newOptions, false, false)
            instance.updateSeries(newSeries, false)
            console.debug('[WeightChart] Chart updated with new data')
          }
        } catch (error) {
          console.warn('[WeightChart] Chart update failed:', error)
        }
      }, 100)

      onCleanup(() => clearTimeout(timer))
    }
  })

  // Memory management cleanup
  onCleanup(() => {
    const instance = chartInstance()
    if (instance) {
      try {
        if (typeof instance.destroy === 'function') {
          instance.destroy()
        }
        setChartInstance(null)
        console.debug('[WeightChart] Chart instance destroyed')
      } catch (error) {
        console.warn('[WeightChart] Chart cleanup error:', error)
      }
    }

    // Clear cache on component unmount
    chartDataCache.clear()
    console.debug('[WeightChart] Cache cleared')
  })

  // Optimized memoization with dependency tracking
  const weightsByPeriod = createMemo(() => {
    const weights = optimizedWeights()
    return groupWeightsByPeriod(weights ?? [], props.type)
  })

  const data = createMemo(() => {
    const periods = weightsByPeriod()
    if (Object.keys(periods).length === 0) return []
    return buildChartData(periods)
  })

  const movingAverage = createMemo(() => {
    const chartData = data()
    if (chartData.length === 0) return []
    return calculateMovingAverage(chartData, 7)
  })

  const polishedData = createMemo(() => {
    const chartData = data()
    const avgData = movingAverage()
    if (chartData.length === 0) return []

    return chartData.map((weight, index) => ({
      ...weight,
      movingAverage: avgData[index] ?? 0,
      desiredWeight: props.desiredWeight,
    }))
  })

  const minMax = createMemo(() => {
    const polished = polishedData()
    if (polished.length === 0) return { min: 0, max: 100 }

    let min = Infinity
    let max = -Infinity

    for (const weight of polished) {
      const currentMin = Math.min(weight.desiredWeight, weight.low)
      const currentMax = Math.max(weight.desiredWeight, weight.high)
      if (currentMin < min) min = currentMin
      if (currentMax > max) max = currentMax
    }

    return { min, max }
  })

  const options = createMemo(() => {
    const { min, max } = minMax()
    const weights = optimizedWeights()
    return buildWeightChartOptions({
      min,
      max,
      type: props.type,
      weights: weights ?? [],
      polishedData: polishedData(),
      isMobile: isMobile(),
    })
  })

  const series = createMemo(() => buildWeightChartSeries(polishedData()))

  const chartHeight = () => (isMobile() ? 400 : 600)

  // Render phase-based loading messages
  const loadingMessage = () => {
    switch (renderPhase()) {
      case 'idle':
        return 'Iniciando carregamento...'
      case 'data-processing':
        return `Processando ${props.weights.length} pontos de dados...`
      case 'chart-building':
        return `Construindo gráfico (${processedDataCount()} pontos)...`
      default:
        return 'Carregando...'
    }
  }

  return (
    <Show
      when={renderPhase() === 'complete'}
      fallback={
        <div
          class="flex items-center justify-center rounded-lg bg-gray-700/30 animate-pulse"
          style={{ height: `${chartHeight()}px` }}
        >
          <div class="text-center">
            <div class="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <div class="text-gray-400 text-sm">{loadingMessage()}</div>
            {renderPhase() === 'data-processing' && (
              <div class="text-gray-500 text-xs mt-1">
                Otimizando para dispositivo {isMobile() ? 'móvel' : 'desktop'}
              </div>
            )}
          </div>
        </div>
      }
    >
      <SolidApexCharts
        type="candlestick"
        options={options()}
        series={series()}
        height={chartHeight()}
        onInit={(chart: {
          destroy?: () => void
          updateSeries?: (series: unknown, animate?: boolean) => void
          updateOptions?: (
            options: unknown,
            redrawPaths?: boolean,
            animate?: boolean,
          ) => void
        }) => {
          setChartInstance(chart)
          console.debug('[WeightChart] Chart instance initialized')
        }}
      />
    </Show>
  )
}
