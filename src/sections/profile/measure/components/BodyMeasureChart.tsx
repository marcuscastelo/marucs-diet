import { type ApexOptions } from 'apexcharts'
import { SolidApexCharts } from 'solid-apexcharts'
import { createMemo, Show } from 'solid-js'

import ptBrLocale from '~/assets/locales/apex/pt-br.json'
import { type BodyMeasure } from '~/modules/measure/domain/measure'
import { currentUser } from '~/modules/user/application/user'
import { userWeights } from '~/modules/weight/application/weight'
import { type BodyFatInput, calculateBodyFat } from '~/shared/utils/bfMath'
import { createDebug } from '~/shared/utils/createDebug'
import { dateToYYYYMMDD } from '~/shared/utils/date'

const debug = createDebug('BodyMeasureChart')

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
  measures: readonly BodyMeasure[]
}

/**
 * Renders a chart for body measurements and body fat percentage.
 * @param props - BodyMeasureChartProps
 * @returns SolidJS component
 */
export function BodyMeasureChart(props: BodyMeasureChartProps) {
  const measuresByDay = () => {
    const grouped = props.measures.reduce<Record<string, BodyMeasure[]>>(
      (acc, measure) => {
        const day = dateToYYYYMMDD(measure.target_timestamp)
        if (acc[day] === undefined) {
          acc[day] = []
        }
        acc[day].push(measure)

        return acc
      },
      {},
    )
    debug('measuresByDay', grouped)
    return grouped
  }

  const data = (): DayMeasures[] => {
    const result = Object.entries(measuresByDay())
      .map(([day, measures]) => {
        // Filter out invalid/negative/NaN values for all measures
        const validMeasures = measures.filter((m) => {
          return (
            isFinite(m.height) &&
            m.height > 0 &&
            isFinite(m.waist) &&
            m.waist > 0 &&
            (m.hip === undefined || (isFinite(m.hip) && m.hip > 0)) &&
            isFinite(m.neck) &&
            m.neck > 0
          )
        })
        if (validMeasures.length === 0) return null
        const heightAverage =
          validMeasures.reduce((acc, m) => acc + m.height, 0) /
          validMeasures.length
        const waistAverage =
          validMeasures.reduce((acc, m) => acc + m.waist, 0) /
          validMeasures.length
        const hipAverage =
          validMeasures.filter((m) => m.hip !== undefined).length > 0
            ? validMeasures.reduce((acc, m) => acc + (m.hip ?? 0), 0) /
              validMeasures.filter((m) => m.hip !== undefined).length
            : undefined
        const neckAverage =
          validMeasures.reduce((acc, m) => acc + m.neck, 0) /
          validMeasures.length
        const weightsOfTheDay = () =>
          userWeights().filter((weight) => {
            return (
              weight.target_timestamp.toLocaleDateString() === day &&
              isFinite(weight.weight) &&
              weight.weight > 0
            )
          })
        const weightAverage = () =>
          weightsOfTheDay().length > 0
            ? weightsOfTheDay().reduce((acc, w) => acc + w.weight, 0) /
              weightsOfTheDay().length
            : 0
        const dayBf = () => {
          const bf = calculateBodyFat({
            gender: currentUser()?.gender ?? 'female',
            height: heightAverage,
            waist: waistAverage,
            hip: hipAverage,
            neck: neckAverage,
            weight: weightAverage(),
          } satisfies BodyFatInput<'male' | 'female'>)
          return isFinite(bf) && bf > 0 ? parseFloat(bf.toFixed(2)) : 0
        }
        return {
          date: day,
          dayBf: dayBf(),
          dayAverage: {
            height: heightAverage,
            waist: waistAverage,
            hip: hipAverage,
            neck: neckAverage,
          } satisfies DayAverage,
        } satisfies DayMeasures
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return result
  }

  return (
    <>
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
    </>
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
