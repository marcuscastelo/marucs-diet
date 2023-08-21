'use client'

import { MacroNutrients } from '@/model/macroNutrientsModel'
import { Progress } from 'flowbite-react'
import { calculateMacroTarget } from './MacroTargets'
import { CSSProperties, useCallback, useEffect, useState } from 'react'
import { calcCalories } from '@/utils/macroMath'
import { useUserContext } from '@/context/users.context'
import { fetchUserWeights } from '@/controllers/weights'
import { Loadable } from '@/utils/loadable'
import { Weight } from '@/model/weightModel'
import { latestWeight } from '@/utils/weightUtils'

export default function DayMacros({
  macros,
  className,
}: {
  macros: MacroNutrients
  className?: string
}) {
  const { user } = useUserContext()

  const [weights, setWeights] = useState<Loadable<Weight[]>>({ loading: true })

  const handleRefetchWeights = useCallback(() => {
    fetchUserWeights(user.id).then((weights) =>
      setWeights({ loading: false, errored: false, data: weights }),
    )
  }, [user.id])

  useEffect(() => {
    handleRefetchWeights()
  }, [handleRefetchWeights])

  if (weights.loading || weights.errored) {
    return <h1>Carregando...</h1>
  }

  const weight = latestWeight(weights.data)?.weight

  if (!weight) {
    return <h1>O usuário não possui pesos registrados</h1>
  }

  const macroProfile = user.macro_profile
  const targetMacros = calculateMacroTarget(weight, macroProfile)

  const targetCalories = calcCalories(targetMacros)

  return (
    <>
      <div className={`flex pt-3 ${className} flex-col xs:flex-row `}>
        <div className="flex-shrink">
          <Calories
            className="w-full"
            macros={macros}
            targetCalories={targetCalories}
          />
        </div>
        <div className="flex-1">
          <Macros
            className="mt-3 text-xl xs:mt-0"
            macros={macros}
            targetMacros={targetMacros}
          />
        </div>
      </div>
    </>
  )
}

function Calories({
  macros,
  targetCalories,
  className,
}: {
  macros: MacroNutrients
  targetCalories: number
  className?: string
}) {
  const calories = calcCalories(macros)
  return (
    <>
      <div className={`h-24 overflow-y-clip text-center ${className}`}>
        <div
          className="radial-progress text-blue-600"
          style={
            {
              '--value': (100 * (calories / targetCalories)) / 2,
              '--size': '12rem',
              '--thickness': '0.7rem',
              transform: `rotate(90deg) scale(-1, -1)`,
            } as CSSProperties
          }
        >
          <span
            className=""
            style={{
              transform: `rotate(-90deg) scale(-1, -1) translate(0, -0.5rem)`,
            }}
          >
            {Math.round(calories).toFixed(2)}/
            {Math.round(targetCalories).toFixed(2)}kcal
          </span>
        </div>
      </div>
    </>
  )
}

function Macros({
  macros,
  targetMacros,
  className,
}: {
  macros: MacroNutrients
  targetMacros: MacroNutrients
  className?: string
}) {
  return (
    <div className={`mx-2 ${className}`}>
      <Progress
        className=""
        size="sm"
        textLabelPosition="outside"
        color="green"
        textLabel={`Carboidrato (${Math.round(macros.carbs * 100) / 100}/${
          Math.round(targetMacros.carbs * 100) / 100
        }g)`}
        labelText={true}
        progress={(100 * macros.carbs) / targetMacros.carbs}
      />
      <Progress
        className=""
        size="sm"
        textLabelPosition="outside"
        color="red"
        textLabel={`Proteína (${Math.round(macros.protein * 100) / 100}/${
          Math.round(targetMacros.protein * 100) / 100
        }g)`}
        labelText={true}
        progress={(100 * macros.protein) / targetMacros.protein}
      />
      <Progress
        className=""
        size="sm"
        textLabelPosition="outside"
        color="yellow"
        textLabel={`Gordura (${Math.round(macros.fat * 100) / 100}/${
          Math.round(targetMacros.fat * 100) / 100
        }g)`}
        labelText={true}
        progress={(100 * macros.fat) / targetMacros.fat}
      />
    </div>
  )
}
