'use client'

import { OHLC } from '@/model/ohlcModel'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CandleStickShape } from './shapes/CandleStickShape'
import { calculateWeightProgress } from '@/utils/weightUtils'

const colors = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
]

const prepareData = <T extends OHLC>(data: T[]) => {
  return data.map(({ open, close, ...other }) => {
    return {
      ...other,
      openClose: [open, close === open ? close + 0.1 : close, open === close],
    }
  })
}

export const CandleStickChart = <T extends OHLC & Record<string, unknown>>({
  data: rawData,
  children,
}: {
  data: T[]
  children?: React.ReactNode
}) => {
  const data = prepareData(rawData)
  data.forEach(console.log)
  const dataMargin = 0.01

  // Min and max values of an object of Record<string, number> (do not use low and high, since they are not necessarily the min and max values)
  const minValue = Math.min(
    ...data.map(
      (d) =>
        Math.min(
          ...(Object.values(d).filter(
            (v) => typeof v === 'number',
          ) as number[]),
        ) *
        (1 - dataMargin),
    ),
  )
  const maxValue = Math.max(
    ...data.map(
      (d) =>
        Math.max(
          ...(Object.values(d).filter(
            (v) => typeof v === 'number',
          ) as number[]),
        ) *
        (1 + dataMargin),
    ),
  )

  console.log(data)
  console.log(minValue, maxValue)

  return (
    <>
      <ResponsiveContainer width="95%" height={400}>
        <ComposedChart data={data} className="">
          <XAxis dataKey="date" />
          <YAxis
            domain={[minValue, maxValue]}
            type="number"
            allowDecimals={false}
            ticks={Array.from(Array(10).keys()).map(
              (i) =>
                Math.floor(minValue + (maxValue - minValue) * (i / 10)) + 1,
            )}
          />
          <Tooltip
            content={({ payload, label, active }) => {
              if (!active || !payload) return null
              const { low, high, movingAverage } = payload[0].payload
              return (
                <div className="bg-slate-700 p-5 opacity-80">
                  <h1>
                    Variação: {low} ~ {high}
                  </h1>
                  <h1>Média: {movingAverage}</h1>
                  <h1>{label}</h1>
                </div>
              )
            }}
          />
          <CartesianGrid opacity={0.1} />
          <Bar
            dataKey="openClose"
            fill="#8884d8"
            shape={CandleStickShape}
            // label={{ position: 'top' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % 20]} />
            ))}
          </Bar>
          {children}
        </ComposedChart>
      </ResponsiveContainer>
    </>
  )
}
