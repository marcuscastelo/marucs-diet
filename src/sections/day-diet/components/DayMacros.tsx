import { createMemo, Show } from 'solid-js'

import { currentDayDiet } from '~/modules/diet/day-diet/application/dayDiet'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import {
  createNewMacroNutrients,
  type MacroNutrients,
} from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { getMacroTargetForDay } from '~/modules/diet/macro-target/application/macroTarget'
import { Progress } from '~/sections/common/components/Progress'
import { stringToDate } from '~/shared/utils/date/dateUtils'
import { calcCalories, calcDayMacros } from '~/shared/utils/macroMath'

export default function DayMacros(props: {
  class?: string
  dayDiet?: DayDiet
}) {
  const macroSignals = createMemo(() => {
    const day = props.dayDiet ?? currentDayDiet()
    if (!day) {
      return { error: 'Dia atual não encontrado' }
    }
    const macroTarget_ = getMacroTargetForDay(stringToDate(day.target_day))
    if (macroTarget_ === null) {
      return { error: 'Peso ou meta de macros não encontrada para o dia.' }
    }
    const dayMacros = calcDayMacros(day)
    return {
      macroTarget: macroTarget_,
      macros: dayMacros,
      targetCalories: calcCalories(macroTarget_),
      error: null,
    }
  })

  return (
    <Show
      when={
        macroSignals().error === null &&
        macroSignals().macros !== undefined &&
        macroSignals().macroTarget !== undefined &&
        macroSignals().targetCalories !== undefined
      }
      fallback={
        <div class="text-red-500 text-sm">
          {macroSignals().error ?? 'Erro desconhecido ao calcular macros.'}
        </div>
      }
    >
      <div class={`flex pt-3 ${props.class} flex-col xs:flex-row `}>
        <div class="shrink">
          <Calories
            class="w-full"
            macros={
              macroSignals().macros ??
              createNewMacroNutrients({ carbs: 0, protein: 0, fat: 0 })
            }
            targetCalories={macroSignals().targetCalories ?? 0}
          />
        </div>
        <div class="flex-1">
          <Macros
            class="mt-3 text-xl xs:mt-0"
            macros={
              macroSignals().macros ??
              createNewMacroNutrients({ carbs: 0, protein: 0, fat: 0 })
            }
            targetMacros={
              macroSignals().macroTarget ??
              createNewMacroNutrients({ carbs: 0, protein: 0, fat: 0 })
            }
          />
        </div>
      </div>
    </Show>
  )
}

function Calories(props: {
  macros: MacroNutrients
  targetCalories: number
  class?: string
}) {
  const calories = () => calcCalories(props.macros)
  return (
    <>
      <div class={`h-24 overflow-y-clip text-center ${props.class}`}>
        <div
          class="radial-progress text-blue-600"
          style={{
            '--value': (100 * (calories() / props.targetCalories)) / 2,
            '--size': '12rem',
            '--thickness': '0.7rem',
            transform: 'rotate(90deg) scale(-1, -1)',
          }}
          role="progressbar"
        >
          <span
            class=""
            style={{
              transform: 'rotate(-90deg) scale(-1, -1) translate(0, -0.5rem)',
            }}
          >
            {Math.round(calories()).toFixed(2)}/
            {Math.round(props.targetCalories).toFixed(2)}kcal
          </span>
        </div>
      </div>
    </>
  )
}

function Macros(props: {
  macros: MacroNutrients
  targetMacros: MacroNutrients
  class?: string
}) {
  // TODO:   Add Progress component
  return (
    <div class={`mx-2 ${props.class}`}>
      <Progress
        class=""
        sizeClass="h-1.5"
        textLabelPosition="outside"
        color="green"
        textLabel={`Carboidrato (${
          Math.round(props.macros.carbs * 100) / 100
        }/${Math.round(props.targetMacros.carbs * 100) / 100}g)`}
        showLabel={true}
        progress={(100 * props.macros.carbs) / props.targetMacros.carbs}
      />
      <Progress
        class=""
        sizeClass="h-1.5"
        textLabelPosition="outside"
        color="red"
        textLabel={`Proteína (${Math.round(props.macros.protein * 100) / 100}/${
          Math.round(props.targetMacros.protein * 100) / 100
        }g)`}
        showLabel={true}
        progress={(100 * props.macros.protein) / props.targetMacros.protein}
      />
      <Progress
        class=""
        sizeClass="h-1.5"
        textLabelPosition="outside"
        color="yellow"
        textLabel={`Gordura (${Math.round(props.macros.fat * 100) / 100}/${
          Math.round(props.targetMacros.fat * 100) / 100
        }g)`}
        showLabel={true}
        progress={(100 * props.macros.fat) / props.targetMacros.fat}
      />
    </div>
  )
}
