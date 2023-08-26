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

export function MeasureChart({ measures }: { measures: Measure[] }) {
  type DayAverage = Omit<Measure, '' | 'id' | 'owner' | 'target_timestamp'>
  type DayMeasures = {
    date: string
    dayAverage: DayAverage
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

      return {
        date: day,
        dayAverage: {
          height: heightAverage,
          waist: waistAverage,
          hip: hipAverage,
          neck: neckAverage,
        } satisfies DayAverage,
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <XAxis dataKey="date" />
          <YAxis type="number" allowDecimals={false} />
          <CartesianGrid opacity={0.1} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="dayAverage.height"
            stroke="magenta"
            dot={false}
            strokeWidth={3}
            opacity={0.2}
          />
          <Line
            type="monotone"
            dataKey="dayAverage.waist"
            stroke="orange"
            dot={false}
            strokeWidth={3}
            opacity={0.2}
          />
          <Line
            type="monotone"
            dataKey="dayAverage.hip"
            stroke="cyan"
            dot={false}
            strokeWidth={3}
            opacity={0.2}
          />
          <Line
            type="monotone"
            dataKey="dayAverage.neck"
            stroke="pink"
            dot={false}
            strokeWidth={3}
            opacity={0.2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  )
}
