'use client'
import Capsule from '../Capsule'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
]

const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'
export default function WeightProgress() {
  return (
    <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
      <h5 className={`mx-auto mb-5 text-center text-3xl font-bold`}>
        Progresso do peso
      </h5>
      <div className="mx-20">
        <Capsule
          leftContent={<h5 className={`ml-2 p-2 text-xl`}>Peso Atual (kg)</h5>}
          rightContent={<h5 className={`ml-2 p-2 text-xl`}>0</h5>}
          className={`mb-2`}
        />
        <Capsule
          leftContent={<h5 className={`ml-2 p-2 text-xl`}>Meta (kg)</h5>}
          rightContent={<h5 className={`ml-2 p-2 text-xl`}>0</h5>}
          className={`mb-2`}
        />
      </div>
      <div className="outline">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart width={0} height={400} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="uv"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
            />
            <Area
              type="monotone"
              dataKey="pv"
              stackId="1"
              stroke="#82ca9d"
              fill="#82ca9d"
            />
            <Area
              type="monotone"
              dataKey="amt"
              stackId="1"
              stroke="#ffc658"
              fill="#ffc658"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
