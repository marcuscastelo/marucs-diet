import { SolidApexCharts } from 'solid-apexcharts'
import { createMemo } from 'solid-js'

import {
  buildChartData,
  getYAxisConfig,
} from '~/modules/weight/application/weightChartUtils'
import { type Weight } from '~/modules/weight/domain/weight'
import {
  calculateMovingAverage,
  groupWeightsByPeriod,
} from '~/modules/weight/domain/weightEvolutionDomain'
import { buildWeightChartOptions } from '~/sections/weight/components/WeightChartOptions'
import { buildWeightChartSeries } from '~/sections/weight/components/WeightChartSeries'

/**
 * Props for the WeightChart component.
 */
export type WeightChartProps = {
  weights: readonly Weight[]
  desiredWeight: number
  type: '7d' | '14d' | '30d' | '6m' | '1y' | 'all'
}

/**
 * Renders a candlestick and line chart for weight evolution.
 * @param props - WeightChartProps
 * @returns SolidJS component
 */
export function WeightChart(props: WeightChartProps) {
  // Grouping and chart data
  const weightsByPeriod = createMemo(() =>
    groupWeightsByPeriod(props.weights, props.type),
  )
  const data = createMemo(() => buildChartData(weightsByPeriod()))
  const movingAverage = createMemo(() => calculateMovingAverage(data(), 7))
  const polishedData = createMemo(() =>
    data().map((weight, index) => ({
      ...weight,
      movingAverage: movingAverage()[index] ?? 0,
      desiredWeight: props.desiredWeight,
    })),
  )
  const max = createMemo(() =>
    Math.max(...polishedData().map((w) => Math.max(w.desiredWeight, w.high))),
  )
  const min = createMemo(() =>
    Math.min(...polishedData().map((w) => Math.min(w.desiredWeight, w.low))),
  )
  const yAxis = createMemo(() => getYAxisConfig(min(), max()))
  const options = () =>
    buildWeightChartOptions({
      min: min(),
      max: max(),
      type: props.type,
      weights: props.weights,
      polishedData: polishedData(),
    })
  const series = () => buildWeightChartSeries(polishedData())
  return (
    <SolidApexCharts
      type="candlestick"
      options={options()}
      series={series()}
      height={600}
    />
  )
}
