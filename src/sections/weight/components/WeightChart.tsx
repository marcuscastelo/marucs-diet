import { createMemo, createSignal, onMount, Show } from 'solid-js'

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
export function WeightChart(props: WeightChartProps) {
  const [isMobile, setIsMobile] = createSignal(false)
  const [isChartReady, setIsChartReady] = createSignal(false)

  onMount(() => {
    setIsMobile(isMobileDevice())
    // Simulate processing delay for large datasets
    const timer = setTimeout(
      () => {
        setIsChartReady(true)
      },
      props.weights.length > 50 ? 300 : 100,
    )

    return () => clearTimeout(timer)
  })

  // Mobile-optimized weights with reduced dataset
  const optimizedWeights = createMemo(() => {
    return optimizeWeightsForMobile(props.weights, isMobile())
  })

  // Optimized memoization with dependency tracking
  const weightsByPeriod = createMemo(() => {
    return groupWeightsByPeriod(optimizedWeights(), props.type)
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
    return buildWeightChartOptions({
      min,
      max,
      type: props.type,
      weights: optimizedWeights(),
      polishedData: polishedData(),
      isMobile: isMobile(),
    })
  })

  const series = createMemo(() => buildWeightChartSeries(polishedData()))

  const chartHeight = () => (isMobile() ? 400 : 600)

  return (
    <Show
      when={isChartReady()}
      fallback={
        <div
          class="flex items-center justify-center rounded-lg bg-gray-700/30 animate-pulse"
          style={{ height: `${chartHeight()}px` }}
        >
          <div class="text-center">
            <div class="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <div class="text-gray-400 text-sm">Processando dados...</div>
          </div>
        </div>
      }
    >
      <SolidApexCharts
        type="candlestick"
        options={options()}
        series={series()}
        height={chartHeight()}
      />
    </Show>
  )
}
