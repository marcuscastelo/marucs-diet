'use client'
import { useDaysContext } from '@/sections/day/context/DaysContext'
import Capsule from '@/sections/common/components/capsule/Capsule'

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
import {
  calcCalories,
  calcDayCalories,
  calcDayMacros,
} from '@/legacy/utils/macroMath'
import { useUserContext, useUserId } from '@/sections/user/context/UserContext'
import { calculateMacroTarget } from '@/sections/macros/components/MacroTargets'
import { inForceWeight } from '@/legacy/utils/weightUtils'
import { useWeights } from '@/sections/profile/weight/hooks/useWeights'
import { useMacroProfiles } from '@/sections/profile/macros/hooks/useMacroProfiles'
import {
  inForceMacroProfile,
  latestMacroProfile,
} from '@/legacy/utils/macroProfileUtils'
import { Day } from '@/legacy/model/dayModel'
import { MacroProfile } from '@/legacy/model/macroProfileModel'
import { dateToDDMM } from '@/legacy/utils/dateUtils'
import { Weight } from '@/legacy/model/weightModel'

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

  if (weights.data.length === 0) {
    return <h1>Usuário não possui pesos. Impossível calcular macros.</h1>
  }

  return (
    <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
      <h5 className={`mx-auto mb-5 text-center text-3xl font-bold`}>
        Evolução de Macronutrientes
      </h5>
      <div className="mx-5 lg:mx-20">
        <AllMacrosChart weights={weights.data} />
        <CaloriesChart weights={weights.data} />
        <ProteinChart weights={weights.data} />
        <FatChart weights={weights.data} />
        <CarbsChart weights={weights.data} />
      </div>
    </div>
  )
}

function createChartData(
  weights: Weight[],
  days: Day[],
  macroProfiles: MacroProfile[],
) {
  const data = days.map((day) => {
    const dayDate = new Date(day.target_day)

    const currentWeight = inForceWeight(weights, dayDate)
    const currentMacroProfile = inForceMacroProfile(macroProfiles, dayDate)
    const macroTarget = currentMacroProfile
      ? calculateMacroTarget(currentWeight?.weight ?? 0, currentMacroProfile)
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

function AllMacrosChart({ weights }: { weights: Weight[] }) {
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

  const proteinDeviance = days.data
    .map((day) => {
      const currentWeight = inForceWeight(weights, new Date(day.target_day))
      const macroTargets = calculateMacroTarget(
        currentWeight?.weight ?? 0,
        macroProfile,
      )
      const dayMacros = calcDayMacros(day)
      return dayMacros.protein - macroTargets.protein
    })
    .reduce((a, b) => a + b, 0)

  const fatDeviance = days.data
    .map((day) => {
      const currentWeight = inForceWeight(weights, new Date(day.target_day))
      const macroTargets = calculateMacroTarget(
        currentWeight?.weight ?? 0,
        macroProfile,
      )
      const dayMacros = calcDayMacros(day)
      return dayMacros.fat - macroTargets.fat
    })
    .reduce((a, b) => a + b, 0)

  const data = createChartData(weights, days.data, macroProfiles.data)

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
          <Tooltip
            content={({ payload, label, active }) => {
              if (!active || !payload) return null
              const {
                protein,
                fat,
                carbs,
                targetGrams,
                calories,
                targetCalories,
                targetProtein,
                targetFat,
                targetCarbs,
              } = payload[0].payload
              return (
                <div className="bg-slate-700 p-5 opacity-80">
                  {calories && <h1> Calorias: {calories}kcal </h1>}
                  {targetCalories && (
                    <h1> Meta Calorias: {targetCalories}kcal </h1>
                  )}
                  {protein && (
                    <h1>
                      Proteína: {protein}g / {targetProtein}g
                    </h1>
                  )}
                  {fat && (
                    <h1>
                      Gordura: {fat}g / {targetFat}g
                    </h1>
                  )}
                  {carbs && (
                    <h1>
                      Carboidrato: {carbs}g /{targetCarbs}g
                    </h1>
                  )}
                  {targetGrams && (
                    <h1>
                      {' '}
                      Total:{' '}
                      {[carbs, fat, protein]
                        .map(Number)
                        .reduce((a, b) => a + b, 0)}
                      g / {targetGrams}g{' '}
                    </h1>
                  )}

                  <h1>{label}</h1>
                </div>
              )
            }}
          />
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

function CaloriesChart({ weights }: { weights: Weight[] }) {
  const { days } = useDaysContext()
  const { user } = useUserContext()
  const { macroProfiles } = useMacroProfiles(user.id)

  if (days.loading || days.errored) {
    return <h1>Carregando dias...</h1>
  }

  if (macroProfiles.loading || macroProfiles.errored) {
    return <h1>Carregando perfis de macro...</h1>
  }

  const data = createChartData(weights, days.data, macroProfiles.data)

  return (
    <div>
      <div className="text-3xl text-center">Calorias</div>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={CHART_DATE_ANGLE} />
          <YAxis />
          <Tooltip
            content={({ payload, label, active }) => {
              if (!active || !payload) return null
              const { calories, targetCalories } = payload[0].payload
              return (
                <div className="bg-slate-700 p-5 opacity-80">
                  {calories && <h1> Calorias: {calories}kcal </h1>}
                  {targetCalories && (
                    <h1> Meta Calorias: {targetCalories}kcal </h1>
                  )}
                  <h1>{label}</h1>
                </div>
              )
            }}
          />
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

function ProteinChart({ weights }: { weights: Weight[] }) {
  const { days } = useDaysContext()
  const { user } = useUserContext()
  const { macroProfiles } = useMacroProfiles(user.id)

  if (days.loading || days.errored) {
    return <h1>Carregando dias...</h1>
  }

  if (macroProfiles.loading || macroProfiles.errored) {
    return <h1>Carregando perfis de macro...</h1>
  }

  const data = createChartData(weights, days.data, macroProfiles.data)

  return (
    <div>
      <div className="text-3xl text-center">Proteína</div>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={CHART_DATE_ANGLE} />
          <YAxis />
          <Tooltip
            content={({ payload, label, active }) => {
              if (!active || !payload) return null
              const { protein, targetProtein } = payload[0].payload
              return (
                <div className="bg-slate-700 p-5 opacity-80">
                  {protein && <h1> Proteína: {protein}g </h1>}
                  {targetProtein && <h1> Meta Proteína: {targetProtein}g </h1>}

                  <h1>{label}</h1>
                </div>
              )
            }}
          />
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

function FatChart({ weights }: { weights: Weight[] }) {
  const { days } = useDaysContext()
  const { user } = useUserContext()
  const { macroProfiles } = useMacroProfiles(user.id)

  if (days.loading || days.errored) {
    return <h1>Carregando dias...</h1>
  }

  if (macroProfiles.loading || macroProfiles.errored) {
    return <h1>Carregando perfis de macro...</h1>
  }

  const data = createChartData(weights, days.data, macroProfiles.data)

  return (
    <div>
      <div className="text-3xl text-center">Gordura</div>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={CHART_DATE_ANGLE} />
          <YAxis />
          <Tooltip
            content={({ payload, label, active }) => {
              if (!active || !payload) return null
              const { fat, targetFat } = payload[0].payload
              return (
                <div className="bg-slate-700 p-5 opacity-80">
                  {fat && <h1> Gordura: {fat}g </h1>}
                  {targetFat && <h1> Meta Gordura: {targetFat}g </h1>}

                  <h1>{label}</h1>
                </div>
              )
            }}
          />
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

function CarbsChart({ weights }: { weights: Weight[] }) {
  const { days } = useDaysContext()
  const { user } = useUserContext()
  const { macroProfiles } = useMacroProfiles(user.id)

  if (days.loading || days.errored) {
    return <h1>Carregando...</h1>
  }

  if (macroProfiles.loading || macroProfiles.errored) {
    return <h1>Carregando perfis de macro...</h1>
  }

  const data = createChartData(weights, days.data, macroProfiles.data)
  return (
    <div>
      <div className="text-3xl text-center">Carboidrato</div>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={CHART_DATE_ANGLE} />
          <YAxis />
          <Tooltip
            content={({ payload, label, active }) => {
              if (!active || !payload) return null
              const { carbs, targetCarbs } = payload[0].payload
              return (
                <div className="bg-slate-700 p-5 opacity-80">
                  {carbs && <h1> Carboidrato: {carbs}g </h1>}
                  {targetCarbs && <h1> Meta Carboidrato: {targetCarbs}g </h1>}
                  <h1>{label}</h1>
                </div>
              )
            }}
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
            dataKey="targetCarbs"
            stroke="#FF00FF"
            fill="#FF00FF"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
