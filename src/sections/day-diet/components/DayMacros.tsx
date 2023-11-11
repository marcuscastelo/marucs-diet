import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { calculateMacroTarget } from '~/sections/macro-nutrients/components/MacroTargets'
import { calcCalories } from '~/legacy/utils/macroMath'
import { latestWeight } from '~/legacy/utils/weightUtils'
import { userWeights } from '~/modules/weight/application/weight'
import { Show } from 'solid-js'
import { Progress } from '~/sections/common/components/Progress'
import { latestMacroProfile } from '~/modules/diet/macro-profile/application/macroProfile'

export default function DayMacros(props: {
  macros: MacroNutrients
  class?: string
}) {
  // TODO: Refactor hook to use currentUser() instead of userId (probably delete hook and use use cases)

  const weight = () => latestWeight(userWeights())?.weight ?? null

  const macroSignals = () => {
    const macroProfile_ = latestMacroProfile()
    const weight_ = weight()
    if (macroProfile_ === null) return null
    if (weight_ === null) return null

    return {
      macroTarget: calculateMacroTarget(weight_, macroProfile_),
      targetCalories: calcCalories(
        calculateMacroTarget(weight_, macroProfile_),
      ),
    }
  }

  return (
    <Show
      when={macroSignals()}
      fallback={<>Sem macros: {JSON.stringify(macroSignals())}</>}
    >
      {(macroSignals) => (
        <>
          <div class={`flex pt-3 ${props.class} flex-col xs:flex-row `}>
            <div class="flex-shrink">
              <Calories
                class="w-full"
                macros={props.macros}
                targetCalories={macroSignals().targetCalories}
              />
            </div>
            <div class="flex-1">
              <Macros
                class="mt-3 text-xl xs:mt-0"
                macros={props.macros}
                targetMacros={macroSignals().macroTarget}
              />
            </div>
          </div>
        </>
      )}
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
  // TODO: Add Progress component
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
        labelText={true}
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
        labelText={true}
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
        labelText={true}
        progress={(100 * props.macros.fat) / props.targetMacros.fat}
      />
    </div>
  )
}
