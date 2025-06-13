import { type ApexOptions } from 'apexcharts'
import { SolidApexCharts } from 'solid-apexcharts'
import { createMemo } from 'solid-js'

import ptBrLocale from '~/assets/locales/apex/pt-br.json'
import {
  buildChartData,
  getYAxisConfig,
} from '~/modules/weight/application/weightChartUtils'
import { type Weight } from '~/modules/weight/domain/weight'
import {
  calculateMovingAverage,
  groupWeightsByPeriod,
} from '~/modules/weight/domain/weightEvolutionDomain'

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
      movingAverage: movingAverage()[index],
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
  const options = () => {
    const y = yAxis()
    return {
      theme: { mode: 'dark' },
      xaxis: { type: 'category' },
      yaxis: {
        decimalsInFloat: y.decimalsInFloat,
        min: min() - 1,
        max: max() + 1,
        tickAmount: y.tickAmount,
        labels: {
          formatter: (val: number) => `${val.toFixed(y.decimalsInFloat)} kg`,
        },
      },
      stroke: { width: 3, curve: 'straight' },
      dataLabels: { enabled: false },
      chart: {
        id: 'solidchart-example',
        locales: [ptBrLocale],
        defaultLocale: 'pt-br',
        background: '#1E293B',
        events: {
          beforeZoom: function (ctx: {
            w: { config: { xaxis: { range?: unknown } } }
          }) {
            ctx.w.config.xaxis.range = undefined
          },
        },
        zoom: { autoScaleYaxis: true },
        animations: { enabled: true },
        toolbar: {
          tools: {
            download: false,
            selection: false,
            zoom: true,
            zoomin: false,
            zoomout: false,
            pan: true,
            reset: true,
          },
          autoSelected: 'pan',
        },
      },
      tooltip: {
        shared: true,
        custom({ dataPointIndex, w }: { dataPointIndex: number; w: unknown }) {
          // Restore original tooltip logic
          const chartW = w as {
            config?: {
              series?: Array<{
                data?: Array<{ x: string; y: number[] | number }>
              }>
            }
          }
          const point =
            chartW.config &&
            chartW.config.series &&
            chartW.config.series[0] &&
            chartW.config.series[0].data
              ? (chartW.config.series[0].data[dataPointIndex] as
                  | { x: string; y: number[] }
                  | undefined)
              : undefined
          const avg =
            chartW.config &&
            chartW.config.series &&
            chartW.config.series[1] &&
            chartW.config.series[1].data &&
            typeof chartW.config.series[1].data[dataPointIndex]?.y === 'number'
              ? chartW.config.series[1].data[dataPointIndex].y
              : undefined
          const desired =
            chartW.config &&
            chartW.config.series &&
            chartW.config.series[2] &&
            chartW.config.series[2].data &&
            typeof chartW.config.series[2].data[dataPointIndex]?.y === 'number'
              ? chartW.config.series[2].data[dataPointIndex].y
              : undefined
          let range = ''
          if (point && Array.isArray(point.y) && point.y.length >= 3) {
            const low = point.y[2]
            const high = point.y[1]
            if (typeof low === 'number' && typeof high === 'number') {
              range = `${low.toFixed(2)}~${high.toFixed(2)}`
            }
          }
          let progress = ''
          // Calculate progress as distance from first ever weight to target
          let firstWeightValue: number | undefined
          if (Array.isArray(props.weights) && props.weights.length > 0) {
            // Find the earliest weight in the full dataset
            const sorted = [...props.weights].sort(
              (a, b) =>
                a.target_timestamp.getTime() - b.target_timestamp.getTime(),
            )
            firstWeightValue = sorted[0]?.weight
          }
          if (
            typeof desired === 'number' &&
            typeof firstWeightValue === 'number' &&
            point &&
            Array.isArray(point.y) &&
            typeof point.y[3] === 'number' &&
            desired !== firstWeightValue
          ) {
            const close = point.y[3]
            const progress_ =
              (firstWeightValue - close) / (firstWeightValue - desired)
            progress = (progress_ * 100).toFixed(2) + '%'
          }
          return `<div style='padding:8px'>
            <div><b>${point?.x ?? ''}</b></div>
            <div><b>${range}</b></div>
            <div>Média: <b>${avg !== undefined ? avg.toFixed(2) : '-'}</b></div>
            <div>Peso desejado: <b>${desired !== undefined ? desired.toFixed(2) : '-'}</b></div>
            <div>Progresso: <b>${progress}</b></div>
          </div>`
        },
      },
    } satisfies ApexOptions
  }
  const series = createMemo(() => [
    {
      type: 'candlestick',
      name: 'Pesos',
      data: polishedData().map((weight) => {
        const isInterpolated =
          (weight as { isInterpolated?: boolean }).isInterpolated === true
        return {
          x: weight.date,
          y: [weight.open, weight.high, weight.low, weight.close],
          fillColor: isInterpolated ? '#888888' : undefined,
          strokeColor: isInterpolated ? '#888888' : undefined,
        }
      }),
    },
    {
      type: 'line',
      name: 'Média',
      color: '#FFA50055',
      data: polishedData().map((weight) => ({
        x: weight.date,
        y: weight.movingAverage,
      })),
    },
    {
      type: 'line',
      name: 'Peso desejado',
      color: '#FF00FF',
      data: polishedData().map((weight) => ({
        x: weight.date,
        y: weight.desiredWeight,
      })),
    },
  ])
  return (
    <SolidApexCharts
      type="candlestick"
      options={options()}
      series={series()}
      height={600}
    />
  )
}
