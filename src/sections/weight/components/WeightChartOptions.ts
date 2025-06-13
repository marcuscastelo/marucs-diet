import ptBrLocale from '~/assets/locales/apex/pt-br.json'
import { getYAxisConfig } from '~/modules/weight/application/weightChartUtils'
import { type WeightChartOHLC } from '~/modules/weight/application/weightChartUtils'
import { type Weight } from '~/modules/weight/domain/weight'
import { WeightChartTooltip } from '~/sections/weight/components/WeightChartTooltip'

/**
 * Builds ApexCharts options for the weight chart.
 * @param params - Options params
 * @returns ApexOptions
 */
export function buildWeightChartOptions({
  min,
  max,
  type,
  weights,
  polishedData,
}: {
  min: number
  max: number
  type: string
  weights: readonly Weight[]
  polishedData: readonly ({
    movingAverage: number
    desiredWeight: number
  } & WeightChartOHLC)[]
}) {
  const y = getYAxisConfig(min, max)
  return {
    theme: { mode: 'dark' as const },
    xaxis: { type: 'category' as const },
    yaxis: {
      decimalsInFloat: y.decimalsInFloat,
      min: min - 1,
      max: max + 1,
      tickAmount: y.tickAmount,
      labels: {
        formatter: (val: number) => `${val.toFixed(y.decimalsInFloat)} kg`,
      },
    },
    stroke: { width: 3, curve: 'straight' as const },
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
        autoSelected: 'pan' as const,
      },
    },
    tooltip: {
      shared: true,
      custom: ({ dataPointIndex, w }: { dataPointIndex: number; w: unknown }) =>
        WeightChartTooltip({
          dataPointIndex,
          w,
          weights,
          type,
          polishedData,
        }),
    },
  }
}
