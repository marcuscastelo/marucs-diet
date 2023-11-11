import { type Measure } from '~/modules/measure/domain/measure'
import { type BodyFatInput, calculateBodyFat } from '~/legacy/utils/bfMath'
import { currentUser } from '~/modules/user/application/user'
import { userWeights } from '~/modules/weight/application/weight'
import { SolidApexCharts } from 'solid-apexcharts'
import ptBrLocale from '~/assets/locales/apex/pt-br.json'
import { type ApexOptions } from 'apexcharts'
import { createMemo } from 'solid-js'
import { dateToYYYYMMDD } from '~/legacy/utils/dateUtils'

type DayAverage = Omit<Measure, '__type' | 'id' | 'owner' | 'target_timestamp'>
type DayMeasures = {
  date: string
  dayAverage: DayAverage
  dayBf: number
}

export function MeasureChart(props: { measures: readonly Measure[] }) {
  const measuresByDay = () =>
    props.measures.reduce<Record<string, Measure[]>>((acc, measure) => {
      const day = dateToYYYYMMDD(measure.target_timestamp)
      if (acc[day] === undefined) {
        acc[day] = []
      }
      acc[day].push(measure)
      return acc
    }, {})

  const data = (): DayMeasures[] =>
    Object.entries(measuresByDay())
      .map(([day, measures]) => {
        const heightAverage =
          measures.reduce((acc, measure) => acc + measure.height, 0) /
          measures.length

        const waistAverage =
          measures.reduce((acc, measure) => acc + measure.waist, 0) /
          measures.length

        const hipAverage =
          measures.reduce((acc, measure) => acc + (measure.hip ?? 0), 0) /
          measures.filter((measure) => measure.hip).length

        const neckAverage =
          measures.reduce((acc, measure) => acc + measure.neck, 0) /
          measures.length

        const weightsOfTheDay = () =>
          userWeights().filter(
            (weight) =>
              weight.target_timestamp.toLocaleDateString() === day &&
              weight.weight,
          )

        const weightAverage = () =>
          weightsOfTheDay().reduce((acc, weight) => acc + weight.weight, 0) /
          weightsOfTheDay().length

        if (currentUser() === null) {
          console.log('currentUser.value === null')
          throw new Error('currentUser.value === null')
        }

        const dayBf = () =>
          parseFloat(
            calculateBodyFat({
              gender: currentUser()?.gender ?? 'female',
              height: heightAverage,
              waist: waistAverage,
              hip: hipAverage,
              neck: neckAverage,
              weight: weightAverage(),
            } satisfies BodyFatInput<'male' | 'female'>).toFixed(2),
          )

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
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

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
      <>
        <SolidApexCharts
          type="candlestick"
          options={options()}
          series={series().list}
          height={200}
        />
      </>
    </>
  )
}
