import { type ApexOptions } from 'apexcharts'
import { SolidApexCharts } from 'solid-apexcharts'
import { createMemo } from 'solid-js'

import ptBrLocale from '~/assets/locales/apex/pt-br.json'
import { type OHLC } from '~/modules/measure/domain/ohlc'
import {
  buildChartData,
  getYAxisConfig,
} from '~/modules/weight/application/weightChartUtils'
import { type Weight } from '~/modules/weight/domain/weight'
import {
  calculateMovingAverage,
  groupWeightsByPeriod,
} from '~/modules/weight/domain/weightEvolutionDomain'

export function WeightChart(props: {
  weights: readonly Weight[]
  desiredWeight: number
  type: '7d' | '14d' | '30d' | '6m' | '1y' | 'all'
}) {
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
          // ...existing code for tooltip...
          return '' // Placeholder, will move logic from original file
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
