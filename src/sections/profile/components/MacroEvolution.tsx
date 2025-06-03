import { Capsule } from '~/sections/common/components/capsule/Capsule'

import {
  calcCalories,
  calcDayCalories,
  calcDayMacros,
} from '~/legacy/utils/macroMath'
import { inForceWeight } from '~/legacy/utils/weightUtils'
import { inForceMacroProfile } from '~/legacy/utils/macroProfileUtils'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { type MacroProfile } from '~/modules/diet/macro-profile/domain/macroProfile'
import { dateToDDMM } from '~/shared/utils/date'
import { type Weight } from '~/modules/weight/domain/weight'
import { dayDiets } from '~/modules/diet/day-diet/application/dayDiet'
import { userWeights } from '~/modules/weight/application/weight'
import { userMacroProfiles } from '~/modules/diet/macro-profile/application/macroProfile'
import { calculateMacroTarget } from '~/modules/diet/macro-target/application/macroTarget'
import { CARD_BACKGROUND_COLOR, CARD_STYLE } from '~/modules/theme/constants'

export function MacroEvolution() {
  return (
    <div class={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
      <h5 class={'mx-auto mb-5 text-center text-3xl font-bold'}>
        Evolução de Macronutrientes
      </h5>
      <div class="mx-5 lg:mx-20">
        <AllMacrosChart weights={userWeights()} />
        <CaloriesChart weights={userWeights()} />
        <ProteinChart weights={userWeights()} />
        <FatChart weights={userWeights()} />
        <CarbsChart weights={userWeights()} />
      </div>
    </div>
  )
}

function createChartData(
  weights: readonly Weight[],
  days: readonly DayDiet[],
  macroProfiles: readonly MacroProfile[],
) {
  const data = days.map((day) => {
    const dayDate = new Date(day.target_day)

    const currentWeight = inForceWeight(weights, dayDate)
    const currentMacroProfile = inForceMacroProfile(macroProfiles, dayDate)
    const macroTarget =
      currentMacroProfile !== null
        ? calculateMacroTarget(currentWeight?.weight ?? 0, currentMacroProfile)
        : null

    const dayMacros = calcDayMacros(day)
    const dayCalories = calcDayCalories(day)
    return {
      name: dateToDDMM(dayDate),
      calories: dayCalories.toFixed(0),
      targetCalories:
        macroTarget !== null ? calcCalories(macroTarget) : undefined,
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

function AllMacrosChart(props: { weights: readonly Weight[] }) {
  // const proteinDeviance = dayDiets()
  //   .map((day) => {
  //     const currentWeight = inForceWeight(props.weights, new Date(day.target_day))
  //     const macroTargets = calculateMacroTarget(
  //       currentWeight?.weight ?? 0,
  //       macroProfile()
  //     )
  //     const dayMacros = calcDayMacros(day)
  //     return dayMacros.protein - macroTargets.protein
  //   })
  //   .reduce((a, b) => a + b, 0)

  // const fatDeviance = dayDiets.value
  //   .map((day) => {
  //     const currentWeight = inForceWeight(props.weights, new Date(day.target_day))
  //     const macroTargets = calculateMacroTarget(
  //       currentWeight?.weight ?? 0,
  //       macroProfile
  //     )
  //     const dayMacros = calcDayMacros(day)
  //     return dayMacros.fat - macroTargets.fat
  //   })
  //   .reduce((a, b) => a + b, 0)

  const data = () =>
    createChartData(props.weights, dayDiets(), userMacroProfiles())
  data()

  return (
    <div>
      <div class="text-3xl text-center">Geral</div>
      <Capsule
        leftContent={<h5 class={'ml-2 p-2 text-xl'}>Desvio de Proteína (g)</h5>}
        rightContent={
          <h5 class={'ml-2 p-2 text-xl'}>TODO</h5>
          // <h5 class={'ml-2 p-2 text-xl'}>{proteinDeviance.toFixed(0)}</h5>
        }
        class={'mb-2'}
      />
      <Capsule
        leftContent={<h5 class={'ml-2 p-2 text-xl'}>Desvio de Gordura (g)</h5>}
        rightContent={
          <h5 class={'ml-2 p-2 text-xl'}>TODO</h5>
          // <h5 class={'ml-2 p-2 text-xl'}>{fatDeviance.toFixed(0)}</h5>
        }
        class={'mb-2'}
      />
      {/* <ResponsiveContainer width="90%" height={400}>
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
                targetCarbs
              } = payload[0].payload
              return (
                <div class="bg-slate-700 p-5 opacity-80">
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
      </ResponsiveContainer> */}
    </div>
  )
}

function CaloriesChart(props: { weights: readonly Weight[] }) {
  const data = () =>
    createChartData(props.weights, dayDiets(), userMacroProfiles())
  data()

  return (
    <div>
      <div class="text-3xl text-center">Calorias</div>
      {/* <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={CHART_DATE_ANGLE} />
          <YAxis />
          <Tooltip
            content={({ payload, label, active }) => {
              if (!active || !payload) return null
              const { calories, targetCalories } = payload[0].payload
              return (
                <div class="bg-slate-700 p-5 opacity-80">
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
      </ResponsiveContainer> */}
    </div>
  )
}

function ProteinChart(props: { weights: readonly Weight[] }) {
  const data = () =>
    createChartData(props.weights, dayDiets(), userMacroProfiles())
  data()

  return (
    <div>
      <div class="text-3xl text-center">Proteína</div>
      {/* <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={CHART_DATE_ANGLE} />
          <YAxis />
          <Tooltip
            content={({ payload, label, active }) => {
              if (!active || !payload) return null
              const { protein, targetProtein } = payload[0].payload
              return (
                <div class="bg-slate-700 p-5 opacity-80">
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
      </ResponsiveContainer> */}
    </div>
  )
}

function FatChart(props: { weights: readonly Weight[] }) {
  const data = () =>
    createChartData(props.weights, dayDiets(), userMacroProfiles())
  data()

  return (
    <div>
      <div class="text-3xl text-center">Gordura</div>
      {/* <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={CHART_DATE_ANGLE} />
          <YAxis />
          <Tooltip
            content={({ payload, label, active }) => {
              if (!active || !payload) return null
              const { fat, targetFat } = payload[0].payload
              return (
                <div class="bg-slate-700 p-5 opacity-80">
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
      </ResponsiveContainer> */}
    </div>
  )
}

function CarbsChart(props: { weights: readonly Weight[] }) {
  const data = () =>
    createChartData(props.weights, dayDiets(), userMacroProfiles())
  data()

  return (
    <div>
      <div class="text-3xl text-center">Carboidrato</div>
      {/* <ResponsiveContainer width="90%" height={400}>
        <ComposedChart width={0} height={400} data={data} syncId={1}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey="name" angle={CHART_DATE_ANGLE} />
          <YAxis />
          <Tooltip
            content={({ payload, label, active }) => {
              if (!active || !payload) return null
              const { carbs, targetCarbs } = payload[0].payload
              return (
                <div class="bg-slate-700 p-5 opacity-80">
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
      </ResponsiveContainer> */}
    </div>
  )
}
