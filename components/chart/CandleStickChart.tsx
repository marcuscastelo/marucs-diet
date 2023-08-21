import { OHLC } from '@/model/ohlcModel'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
import { CandleStickShape } from './shapes/CandleStickShape'

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
      openClose: [open, close],
    }
  })
}

export const CandleStickChart = <T extends OHLC>({
  data: rawData,
  children,
}: {
  data: T[]
  children?: React.ReactNode
}) => {
  const data = prepareData(rawData)
  data.forEach(console.log)
  const minValue = Math.min(...data.map((d) => d.low)) * 0.8
  const maxValue = Math.max(...data.map((d) => d.high)) * 1.25

  console.log(data)
  console.log(minValue, maxValue)

  return (
    <BarChart
      width={600}
      height={300}
      data={data}
      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    >
      <XAxis dataKey="date" />
      <YAxis domain={[minValue, maxValue]} />
      <CartesianGrid strokeDasharray="3 3" />
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
    </BarChart>
  )
}
