import { type Measure } from '@/modules/measure/domain/measure'
import { type BodyFatInput, calculateBodyFat } from '@/legacy/utils/bfMath'
import { currentUser } from '@/modules/user/application/user'
import { userWeights } from '@/modules/weight/application/weight'
type DayAverage = Omit<Measure, '__type' | 'id' | 'owner' | 'target_timestamp'>
type DayMeasures = {
  date: string
  dayAverage: DayAverage
  dayBf: number
}

export function MeasureChart (props: { measures: Measure[] }) {
  const measuresByDay = () => props.measures.reduce<Record<string, Measure[]>>(
    (acc, measure) => {
      const day = measure.target_timestamp.toLocaleDateString()
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(measure)
      return acc
    },
    {}
  )

  const data = (): DayMeasures[] => Object.entries(measuresByDay())
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

      const weightsOfTheDay = () => userWeights().filter(
        (weight) =>
          weight.target_timestamp.toLocaleDateString() === day && weight.weight
      )

      const weightAverage = () =>
        weightsOfTheDay().reduce((acc, weight) => acc + weight.weight, 0) /
        weightsOfTheDay().length

      if (currentUser() === null) {
        console.log('currentUser.value === null')
        throw new Error('currentUser.value === null')
      }

      const dayBf = () => parseFloat(
        calculateBodyFat({
          gender: currentUser()?.gender ?? 'female',
          height: heightAverage,
          waist: waistAverage,
          hip: hipAverage,
          neck: neckAverage,
          weight: weightAverage()
        } satisfies BodyFatInput<'male' | 'female'>).toFixed(2)
      )

      return {
        date: day,
        dayBf: dayBf(),
        dayAverage: {
          height: heightAverage,
          waist: waistAverage,
          hip: hipAverage,
          neck: neckAverage
        } satisfies DayAverage
      } satisfies DayMeasures
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <>
      <ChartFor
        title="Altura"
        acessor={(day) => day.dayAverage.height}
        data={data()}
        dataKey="dayAverage.height"
        color="magenta"
      />
      <ChartFor
        title="Cintura"
        acessor={(day) => day.dayAverage.waist}
        data={data()}
        dataKey="dayAverage.waist"
        color="blue"
      />
      <ChartFor
        title="Quadril"
        acessor={(day) => day.dayAverage.hip ?? -1}
        data={data()}
        dataKey="dayAverage.hip"
        color="green"
      />
      <ChartFor
        title="Pescoço"
        acessor={(day) => day.dayAverage.neck}
        data={data()}
        dataKey="dayAverage.neck"
        color="red"
      />
      <ChartFor
        title="BF"
        acessor={(day) => day.dayBf}
        data={data()}
        dataKey="dayBf"
        color="orange"
      />
    </>
  )
}

function ChartFor (props: {
  title: string
  data: DayMeasures[]
  acessor: (day: DayMeasures) => number
  dataKey: string
  color: string
}) {
  return (
    <>
      <h1 class="text-3xl text-center">{props.title}</h1>
      //TODO: Add new charts
      {/* <ResponsiveContainer width="95%" height={100}>
        <ComposedChart data={props.data} syncId={'measure-chart'}>
          <XAxis dataKey="date" />
          <YAxis
            type="number"
            allowDecimals={false}
            domain={['datamin - 1', 'datamax + 1']}
          />
          <CartesianGrid opacity={0.1} />
          <Tooltip
            content={({ payload, label, active }) => {
              if (!active || !payload) return null

              const value = props.acessor(payload[0].payload as DayMeasures)

              return (
                <div class="bg-slate-700 p-5 opacity-80">
                  <h1>{label}</h1>
                  <h1>
                    {props.title}: {value.toFixed(2)} {props.title === 'BF' && '%'}
                  </h1>
                </div>
              )
            }}
          />
          <Line
            type="monotone"
            dataKey={props.dataKey}
            stroke={props.color}
            dot={false}
            strokeWidth={3}
          />
        </ComposedChart>
      </ResponsiveContainer> */}
    </>
  )
}
