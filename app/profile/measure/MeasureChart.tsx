'use client'

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Measure } from '@/model/measureModel'
import { BodyFatInput, calculateBodyFat } from '@/utils/bfMath'
import { useUserGender, useUserId } from '@/context/users.context'
import { useWeights } from '@/hooks/weights'
type DayAverage = Omit<Measure, '__type' | 'id' | 'owner' | 'target_timestamp'>
type DayMeasures = {
  date: string
  dayAverage: DayAverage
  dayBf: number
}

export function MeasureChart({ measures }: { measures: Measure[] }) {
  const userId = useUserId()
  const userGender = useUserGender()

  const { weights } = useWeights(userId)

  if (weights.loading || weights.errored) {
    return <h1>Carregando pesos...</h1>
  }

  const measuresByDay = measures.reduce(
    (acc, measure) => {
      const day = measure.target_timestamp.toLocaleDateString()
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(measure)
      return acc
    },
    {} as { [day: string]: Measure[] },
  )

  const data: DayMeasures[] = Object.entries(measuresByDay)
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

      const weightsOfTheDay = weights.data.filter(
        (weight) =>
          weight.target_timestamp.toLocaleDateString() === day && weight.weight,
      )

      const weightAverage =
        weightsOfTheDay.reduce((acc, weight) => acc + weight.weight, 0) /
        weightsOfTheDay.length

      const dayBf = parseFloat(
        calculateBodyFat({
          gender: userGender,
          height: heightAverage,
          waist: waistAverage,
          hip: hipAverage,
          neck: neckAverage,
          weight: weightAverage,
        } satisfies BodyFatInput<'male' | 'female'>).toFixed(2),
      )

      return {
        date: day,
        dayBf,
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
        acessor={(day) => day.dayAverage.height}
        data={data}
        dataKey="dayAverage.height"
        color="magenta"
      />
      <ChartFor
        title="Cintura"
        acessor={(day) => day.dayAverage.waist}
        data={data}
        dataKey="dayAverage.waist"
        color="blue"
      />
      <ChartFor
        title="Quadril"
        acessor={(day) => day.dayAverage.hip ?? -1}
        data={data}
        dataKey="dayAverage.hip"
        color="green"
      />
      <ChartFor
        title="Pescoço"
        acessor={(day) => day.dayAverage.neck}
        data={data}
        dataKey="dayAverage.neck"
        color="red"
      />
      <ChartFor
        title="BF"
        acessor={(day) => day.dayBf}
        data={data}
        dataKey="dayBf"
        color="orange"
      />
    </>
  )
}

function ChartFor({
  title,
  data,
  acessor,
  dataKey,
  color,
}: {
  title: string
  data: DayMeasures[]
  acessor: (day: DayMeasures) => number
  dataKey: string
  color: string
}) {
  return (
    <>
      <h1 className="text-3xl text-center">{title}</h1>
      <ResponsiveContainer width="95%" height={100}>
        <ComposedChart data={data} syncId={'measure-chart'}>
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

              const value = acessor(payload[0].payload as DayMeasures)

              return (
                <div className="bg-slate-700 p-5 opacity-80">
                  <h1>{label}</h1>
                  <h1>
                    {title}: {value.toFixed(2)} {title === 'BF' && '%'}
                  </h1>
                </div>
              )
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            dot={false}
            strokeWidth={3}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  )
}
