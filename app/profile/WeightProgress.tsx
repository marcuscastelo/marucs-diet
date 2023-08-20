'use client'
import { useDaysContext } from '@/context/days.context'
import Capsule from '../Capsule'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts'
import { calcCalories, calcDayCalories, calcDayMacros } from '@/utils/macroMath'
import { useUserContext } from '@/context/users.context'
import { calculateMacroTarget } from '../MacroTargets'

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
        <AllMacrosChart />
        <CaloriesChart />
        <ProteinChart />
        <FatChart />
        <CarbsChart />
      </div>
    </div>
  )
}

function AllMacrosChart() {
  const { days } = useDaysContext()
  const { user } = useUserContext()

  if (days.loading || days.errored) {
    return <h1>Carregando...</h1>
  }

  const macroTargets = calculateMacroTarget(user.weight, user.macro_profile)

  const proteinDeviance = days.data
    .map((day) => {
      const dayMacros = calcDayMacros(day)
      return dayMacros.protein - macroTargets.protein
    })
    .reduce((a, b) => a + b, 0)

  const fatDeviance = days.data
    .map((day) => {
      const dayMacros = calcDayMacros(day)
      return dayMacros.fat - macroTargets.fat
    })
    .reduce((a, b) => a + b, 0)

  const data = days.data.map((day) => {
    const dayMacros = calcDayMacros(day)
    return {
      name: `${new Date(day.target_day).getDate()}/${new Date(
        day.target_day,
      ).getMonth()}`,
      protein: dayMacros.protein.toFixed(0),
      carbs: dayMacros.carbs.toFixed(0),
      fat: dayMacros.fat.toFixed(0),
      targetGrams: macroTargets.protein + macroTargets.carbs + macroTargets.fat,
    }
  })
  return (
    <div>
      <div className="text-3xl text-center">Geral</div>
      <Capsule
        leftContent={
          <h5 className={`ml-2 p-2 text-xl`}>Desvio de Proteína (g)</h5>
        }
        rightContent={
          <h5 className={`ml-2 p-2 text-xl`}>{proteinDeviance.toFixed(0)}</h5>
        }
        className={`mb-2`}
      />
      <Capsule
        leftContent={
          <h5 className={`ml-2 p-2 text-xl`}>Desvio de Gordura (g)</h5>
        }
        rightContent={
          <h5 className={`ml-2 p-2 text-xl`}>{fatDeviance.toFixed(0)}</h5>
        }
        className={`mb-2`}
      />
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={30} />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="protein"
            stackId="1"
            stroke="#C81E1E"
            fill="#C81E1E"
          />
          <Area
            type="monotone"
            dataKey="fat"
            stackId="1"
            stroke="#FF8A4C"
            fill="#FF8A4C"
          />
          <Area
            type="monotone"
            dataKey="carbs"
            stackId="1"
            stroke="#31C48D"
            fill="#31C48D"
          />
          <Line
            type="monotone"
            dataKey="targetGrams"
            stroke="#FF00FF"
            fill="#FF00FF"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function CaloriesChart() {
  const { days } = useDaysContext()
  const { user } = useUserContext()

  if (days.loading || days.errored) {
    return <h1>Carregando...</h1>
  }

  const macroTargets = calculateMacroTarget(user.weight, user.macro_profile)
  const data = days.data.map((day) => {
    const dayCalories = calcDayCalories(day)
    return {
      name: `${new Date(day.target_day).getDate()}/${new Date(
        day.target_day,
      ).getMonth()}`,
      calories: dayCalories.toFixed(0),
      targetCalories: calcCalories(macroTargets),
    }
  })
  return (
    <div>
      <div className="text-3xl text-center">Calorias</div>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={30} />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="calories"
            stackId="1"
            stroke="#FFFFFF"
            fill="#FFFFFF"
          />
          <Line
            type="monotone"
            dataKey="targetCalories"
            stroke="#FF00FF"
            fill="#FF00FF"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function ProteinChart() {
  const { days } = useDaysContext()
  const { user } = useUserContext()

  if (days.loading || days.errored) {
    return <h1>Carregando...</h1>
  }

  const macroTargets = calculateMacroTarget(user.weight, user.macro_profile)
  const data = days.data.map((day) => {
    const dayMacros = calcDayMacros(day)
    return {
      name: `${new Date(day.target_day).getDate()}/${new Date(
        day.target_day,
      ).getMonth()}`,
      protein: dayMacros.protein.toFixed(0),
      targetProtein: macroTargets.protein.toFixed(0),
    }
  })
  return (
    <div>
      <div className="text-3xl text-center">Proteína</div>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={30} />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="protein"
            stackId="1"
            stroke="#C81E1E"
            fill="#C81E1E"
          />
          <Line
            type="monotone"
            dataKey="targetProtein"
            stroke="#FF00FF"
            fill="#FF00FF"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function FatChart() {
  const { days } = useDaysContext()
  const { user } = useUserContext()

  if (days.loading || days.errored) {
    return <h1>Carregando...</h1>
  }

  const macroTargets = calculateMacroTarget(user.weight, user.macro_profile)
  const data = days.data.map((day) => {
    const dayMacros = calcDayMacros(day)
    return {
      name: `${new Date(day.target_day).getDate()}/${new Date(
        day.target_day,
      ).getMonth()}`,
      fat: dayMacros.fat.toFixed(0),
      targetFat: macroTargets.fat.toFixed(0),
    }
  })
  return (
    <div>
      <div className="text-3xl text-center">Gordura</div>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={30} />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="fat"
            stackId="1"
            stroke="#FF8A4C"
            fill="#FF8A4C"
          />
          <Line
            type="monotone"
            dataKey="targetFat"
            stroke="#FF00FF"
            fill="#FF00FF"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function CarbsChart() {
  const { days } = useDaysContext()
  const { user } = useUserContext()

  if (days.loading || days.errored) {
    return <h1>Carregando...</h1>
  }

  const macroTargets = calculateMacroTarget(user.weight, user.macro_profile)
  const data = days.data.map((day) => {
    const dayMacros = calcDayMacros(day)
    return {
      name: `${new Date(day.target_day).getDate()}/${new Date(
        day.target_day,
      ).getMonth()}`,
      carbs: dayMacros.carbs.toFixed(0),
      targetCarbs: macroTargets.carbs.toFixed(0),
    }
  })
  return (
    <div>
      <div className="text-3xl text-center">Carboidrato</div>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={30} />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="carbs"
            stackId="1"
            stroke="#31C48D"
            fill="#31C48D"
          />
          <Line
            type="monotone"
            dataKey="targetCarbs"
            stroke="#FF00FF"
            fill="#FF00FF"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
