'use client'
import { useDaysContext } from '@/context/days.context'
import Capsule from '../../../components/capsule/Capsule'

import {
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
import { useUserContext, useUserId } from '@/context/users.context'
import { calculateMacroTarget } from '../../MacroTargets'
import { latestWeight } from '@/utils/weightUtils'
import { useWeights } from '@/hooks/weights'
import { useMacroProfiles } from '@/hooks/macroProfiles'
import {
  inForceMacroProfile,
  latestMacroProfile,
} from '@/utils/macroProfileUtils'
import { Day } from '@/model/dayModel'
import { MacroProfile } from '@/model/macroProfileModel'
import { dateToDDMM } from '@/utils/dateUtils'

// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

const CHART_DATE_ANGLE = -45

export function MacroEvolution() {
  const userId = useUserId()

  const { weights } = useWeights(userId)

  if (weights.loading || weights.errored) {
    return <h1>Carregando...</h1>
  }

  // TODO: plot all weights, not just the latest one
  const weight = latestWeight(weights.data)?.weight

  if (!weight) {
    return <h1>Usuário não possui pesos. Impossível calcular macros.</h1>
  }

  return (
    <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
      <h5 className={`mx-auto mb-5 text-center text-3xl font-bold`}>
        Evolução de Macronutrientes
      </h5>
      <div className="mx-5 lg:mx-20">
        <AllMacrosChart weight={weight} />
        <CaloriesChart weight={weight} />
        <ProteinChart weight={weight} />
        <FatChart weight={weight} />
        <CarbsChart weight={weight} />
      </div>
    </div>
  )
}

function createChartData(
  weight: number,
  days: Day[],
  macroProfiles: MacroProfile[],
) {
  const data = days.map((day) => {
    const dayDate = new Date(day.target_day)

    const currentMacroProfile = inForceMacroProfile(macroProfiles, dayDate)
    const macroTarget = currentMacroProfile
      ? calculateMacroTarget(weight, currentMacroProfile)
      : null

    const dayMacros = calcDayMacros(day)
    const dayCalories = calcDayCalories(day)
    return {
      name: dateToDDMM(dayDate),
      calories: dayCalories.toFixed(0),
      targetCalories: macroTarget ? calcCalories(macroTarget) : undefined,
      protein: dayMacros.protein.toFixed(0),
      targetProtein: macroTarget?.protein?.toFixed(0),
      fat: dayMacros.fat.toFixed(0),
      targetFat: macroTarget?.fat?.toFixed(0),
      carbs: dayMacros.carbs.toFixed(0),
      targetCarbs: macroTarget?.carbs?.toFixed(0),
      targetGrams:
        (macroTarget?.protein ?? NaN) +
        (macroTarget?.carbs ?? NaN) +
        (macroTarget?.fat ?? NaN),
    }
  })

  return data
}

function AllMacrosChart({ weight }: { weight: number }) {
  const { days } = useDaysContext()
  const { user } = useUserContext()
  const { macroProfiles } = useMacroProfiles(user.id)

  if (days.loading || days.errored) {
    return <h1>Carregando dias...</h1>
  }

  if (macroProfiles.loading || macroProfiles.errored) {
    return <h1>Carregando perfis de macro...</h1>
  }

  const macroProfile = latestMacroProfile(macroProfiles.data)

  if (!macroProfile) {
    return (
      <h1>Usuário não possui perfis de macro. Impossível calcular macros.</h1>
    )
  }

  const macroTargets = calculateMacroTarget(weight, macroProfile)

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

  const data = createChartData(weight, days.data, macroProfiles.data)

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
          <XAxis dataKey="name" angle={CHART_DATE_ANGLE} />
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

function CaloriesChart({ weight }: { weight: number }) {
  const { days } = useDaysContext()
  const { user } = useUserContext()
  const { macroProfiles } = useMacroProfiles(user.id)

  if (days.loading || days.errored) {
    return <h1>Carregando dias...</h1>
  }

  if (macroProfiles.loading || macroProfiles.errored) {
    return <h1>Carregando perfis de macro...</h1>
  }

  const data = createChartData(weight, days.data, macroProfiles.data)

  return (
    <div>
      <div className="text-3xl text-center">Calorias</div>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={CHART_DATE_ANGLE} />
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

function ProteinChart({ weight }: { weight: number }) {
  const { days } = useDaysContext()
  const { user } = useUserContext()
  const { macroProfiles } = useMacroProfiles(user.id)

  if (days.loading || days.errored) {
    return <h1>Carregando dias...</h1>
  }

  if (macroProfiles.loading || macroProfiles.errored) {
    return <h1>Carregando perfis de macro...</h1>
  }

  const data = createChartData(weight, days.data, macroProfiles.data)

  return (
    <div>
      <div className="text-3xl text-center">Proteína</div>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={CHART_DATE_ANGLE} />
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

function FatChart({ weight }: { weight: number }) {
  const { days } = useDaysContext()
  const { user } = useUserContext()
  const { macroProfiles } = useMacroProfiles(user.id)

  if (days.loading || days.errored) {
    return <h1>Carregando dias...</h1>
  }

  if (macroProfiles.loading || macroProfiles.errored) {
    return <h1>Carregando perfis de macro...</h1>
  }

  const data = createChartData(weight, days.data, macroProfiles.data)

  return (
    <div>
      <div className="text-3xl text-center">Gordura</div>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={CHART_DATE_ANGLE} />
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

function CarbsChart({ weight }: { weight: number }) {
  const { days } = useDaysContext()
  const { user } = useUserContext()
  const { macroProfiles } = useMacroProfiles(user.id)

  if (days.loading || days.errored) {
    return <h1>Carregando...</h1>
  }

  if (macroProfiles.loading || macroProfiles.errored) {
    return <h1>Carregando perfis de macro...</h1>
  }

  const data = createChartData(weight, days.data, macroProfiles.data)
  return (
    <div>
      <div className="text-3xl text-center">Carboidrato</div>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={CHART_DATE_ANGLE} />
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
