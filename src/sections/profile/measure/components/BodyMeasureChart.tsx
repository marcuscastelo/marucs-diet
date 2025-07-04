import type { ApexOptions } from 'apexcharts'
import { createMemo, Resource, Show, Suspense } from 'solid-js'

import ptBrLocale from '~/assets/locales/apex/pt-br.json'
import { bodyMeasures } from '~/modules/measure/application/measure'
import {
  groupMeasuresByDay,
  processMeasuresByDay,
} from '~/modules/measure/application/measureUtils'
import type { BodyMeasure } from '~/modules/measure/domain/measure'
import { currentUser } from '~/modules/user/application/user'
import { userWeights } from '~/modules/weight/application/weight'
import { lazyImport } from '~/shared/solid/lazyImport'
import { createDebug } from '~/shared/utils/createDebug'

const { SolidApexCharts } = lazyImport(
  () => import('solid-apexcharts'),
  ['SolidApexCharts'],
)

const debug = createDebug()

type DayAverage = Omit<
  BodyMeasure,
  '__type' | 'id' | 'owner' | 'target_timestamp'
>
type DayMeasures = {
  date: string
  dayAverage: DayAverage
  dayBf: number
}

/**
 * Props for the BodyMeasureChart component.
 */
export type BodyMeasureChartProps = {
  measures: typeof bodyMeasures
}

/**
 * Renders a chart for body measurements and body fat percentage.
 * @param props - BodyMeasureChartProps
 * @returns SolidJS component
 */
export function BodyMeasureChart(props: BodyMeasureChartProps) {
  const measuresByDay = createMemo(() =>
    groupMeasuresByDay(props.measures() ?? []),
  )

  const data = createMemo(() =>
    processMeasuresByDay(
      measuresByDay(),
      userWeights.latest ?? [],
      currentUser()?.gender ?? 'female',
    ),
  )

  return (
    <Suspense>
      <ChartFor
        title="Altura"
        accessor={(day) => day.dayAverage.height}
        data={data()}
        dataKey="dayAverage.height"
        color="magenta"
      />
      <ChartFor
        title="Cintura"
        accessor={(day) => day.dayAverage.waist}
        data={data()}
        dataKey="dayAverage.waist"
        color="blue"
      />
      <ChartFor
        title="Quadril"
        accessor={(day) => day.dayAverage.hip ?? -1}
        data={data()}
        dataKey="dayAverage.hip"
        color="green"
      />
      <ChartFor
        title="Pescoço"
        accessor={(day) => day.dayAverage.neck}
        data={data()}
        dataKey="dayAverage.neck"
        color="red"
      />
      <ChartFor
        title="BF"
        accessor={(day) => day.dayBf}
        data={data()}
        dataKey="dayBf"
        color="orange"
      />
    </Suspense>
  )
}

function ChartFor(props: {
  title: string
  data: DayMeasures[]
  accessor: (day: DayMeasures) => number
  dataKey: string
  color: string
}) {
  const options = () =>
    ({
      theme: {
        mode: 'dark',
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        decimalsInFloat: 0,
      },
      stroke: {
        width: 3,
        curve: 'straight',
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#444'],
        },
      },
      chart: {
        id: 'solidchart-example',
        locales: [ptBrLocale],
        defaultLocale: 'pt-br',
        background: '#1E293B',
        zoom: {
          autoScaleYaxis: true,
        },
        animations: {
          enabled: true,
        },
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
    }) satisfies ApexOptions

  const series = createMemo(() => ({
    list: [
      {
        name: props.title,
        type: 'line',
        color: '#876',
        data: props.data.map((day) => ({
          x: day.date,
          y: props.accessor(day),
        })),
      },
    ] satisfies ApexOptions['series'],
  }))

  return (
    <>
      <h1 class="text-3xl text-center">{props.title}</h1>
      <Show
        when={props.data.length > 0}
        fallback={
          <div class="text-center text-gray-400 py-8">
            Sem dados para exibir
          </div>
        }
      >
        <SolidApexCharts
          type="line"
          options={options()}
          series={series().list}
          height={200}
        />
      </Show>
    </>
  )
}
