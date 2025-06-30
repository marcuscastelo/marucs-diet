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
  isMobile = false,
}: {
  min: number
  max: number
  type: string
  weights: readonly Weight[]
  polishedData: readonly ({
    movingAverage: number
    desiredWeight: number
  } & WeightChartOHLC)[]
  isMobile?: boolean
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
    stroke: {
      width: isMobile ? 2 : 3,
      curve: 'straight' as const,
    },
    dataLabels: { enabled: false },
    chart: {
      id: 'weight-chart',
      locales: [ptBrLocale],
      defaultLocale: 'pt-br',
      background: '#1E293B',
      selection: {
        enabled: !isMobile,
      },
      events: {
        beforeZoom(ctx: { w: { config: { xaxis: { range?: unknown } } } }) {
          ctx.w.config.xaxis.range = undefined
        },
        mounted() {
          // Chart mounted event for performance tracking
          if (typeof window !== 'undefined' && Boolean(window.performance)) {
            performance.mark('weight-chart-mounted')
          }
        },
      },
      zoom: {
        enabled: !isMobile,
        autoScaleYaxis: true,
        type: 'x' as const,
      },
      animations: {
        enabled: !isMobile,
        speed: isMobile ? 200 : 800,
        animateGradually: {
          enabled: !isMobile,
          delay: isMobile ? 50 : 150,
        },
        dynamicAnimation: {
          enabled: !isMobile,
          speed: isMobile ? 200 : 350,
        },
      },
      toolbar: {
        show: !isMobile,
        tools: {
          download: false,
          selection: false,
          zoom: !isMobile,
          zoomin: false,
          zoomout: false,
          pan: !isMobile,
          reset: !isMobile,
        },
        autoSelected: 'pan' as const,
      },
      // Mobile-specific optimizations
      ...(isMobile && {
        redrawOnParentResize: false,
        redrawOnWindowResize: false,
        parentHeightOffset: 0,
      }),
    },
    tooltip: {
      shared: true,
      enabled: !isMobile || polishedData.length < 100,
      followCursor: !isMobile,
      intersect: isMobile,
      custom: ({ dataPointIndex, w }: { dataPointIndex: number; w: unknown }) =>
        WeightChartTooltip({
          dataPointIndex,
          w,
          weights,
          type,
          polishedData,
        }),
    },
    // Advanced mobile touch optimizations
    ...(isMobile && {
      grid: {
        padding: {
          left: 10,
          right: 10,
        },
      },
      legend: {
        show: false, // Hide legend on mobile to save space
      },
      markers: {
        size: 0, // Reduce marker size for better mobile performance
        strokeWidth: 0,
        hover: {
          size: 4,
        },
      },
    }),
  }
}
