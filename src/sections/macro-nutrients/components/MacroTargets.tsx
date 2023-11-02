import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { deleteMacroProfile } from '@/legacy/controllers/macroProfiles'
import { type MacroNutrients } from '@/modules/diet/macro-nutrients/domain/macroNutrients'
import { type MacroProfile } from '@/modules/diet/macro-profile/domain/macroProfile'
import { dateToYYYYMMDD } from '@/legacy/utils/dateUtils'
import { calcCalories } from '@/legacy/utils/macroMath'
import { latestMacroProfile } from '@/legacy/utils/macroProfileUtils'
import { createEffect, createSignal } from 'solid-js'

const CARBO_CALORIES = 4 as const
const PROTEIN_CALORIES = 4 as const
const FAT_CALORIES = 9 as const

export type MacroRepresentation = {
  name: string
  percentage: number
  grams: number
  gramsPerKg: number
  calorieMultiplier: number
}

// TODO: calculateMacroTarget should not be exported (move to other module)
export const calculateMacroTarget = (
  weight: number,
  savedMacroTarget: MacroProfile
): MacroNutrients => ({
  carbs: weight * savedMacroTarget.gramsPerKgCarbs,
  protein: weight * savedMacroTarget.gramsPerKgProtein,
  fat: weight * savedMacroTarget.gramsPerKgFat
})

const calculateMacroRepresentation = (
  profile: MacroProfile,
  weight: number
): MacroRepresentation[] => {
  const targetGrams = calculateMacroTarget(weight, profile)
  const calories = calcCalories(targetGrams)

  return [
    {
      name: 'Carboidratos',
      percentage: (targetGrams.carbs * 4) / calories,
      grams: targetGrams.carbs,
      gramsPerKg: profile.gramsPerKgCarbs,
      calorieMultiplier: CARBO_CALORIES
    },
    {
      name: 'Proteínas',
      percentage: (targetGrams.protein * 4) / calories,
      grams: targetGrams.protein,
      gramsPerKg: profile.gramsPerKgProtein,
      calorieMultiplier: PROTEIN_CALORIES
    },
    {
      name: 'Gorduras',
      percentage: (targetGrams.fat * 9) / calories,
      grams: targetGrams.fat,
      gramsPerKg: profile.gramsPerKgFat,
      calorieMultiplier: FAT_CALORIES
    }
  ]
}

// TODO: Enable changing target calories directly (and update macros accordingly)
// const calculateDifferenceInCarbs = (
//   targetCalories: number,
//   weight: number,
//   currentProfile: MacroProfile
// ): number => {
//   const currentCalories = calcCalories(
//     calculateMacroTarget(weight, currentProfile)
//   )
//   return (targetCalories - currentCalories) / CARBO_CALORIES
// }

export type MacroTargetProps = {
  weight: number
  profiles: MacroProfile[]
  className?: string
  onSaveMacroProfile: (newProfile: MacroProfile) => void
  mode: 'edit' | 'view'
}

export function MacroTarget (props: MacroTargetProps) {
  const { show: showConfirmModal } = useConfirmModalContext()
  const profile = latestMacroProfile(props.profiles)
  const oldProfile_ = latestMacroProfile(props.profiles, 1)
  const oldProfile = oldProfile_
    ? {
        hasOldProfile: true as const,
        ...oldProfile_
      }
    : ({
        hasOldProfile: false
      } as const)

  if (profile === null) {
    throw new Error('No macro profile found')
  }

  const initialGrams = calculateMacroTarget(props.weight, profile)
  const initialCalories = calcCalories(initialGrams)
  const [initialCarbsRepr, initialProteinRepr, initialFatRepr] =
    calculateMacroRepresentation(profile, props.weight)

  const [targetCalories, setTargetCalories] = createSignal(initialCalories.toString())

  const [carbsRepr, setCarbsRepr] = createSignal<MacroRepresentation>(initialCarbsRepr)
  const [proteinRepr, setProteinRepr] = createSignal<MacroRepresentation>(initialProteinRepr)
  const [fatRepr, setFatRepr] = createSignal<MacroRepresentation>(initialFatRepr)

  createEffect(() => {
    const [newCarbsRepr, newProteinRepr, newFatRepr] =
      calculateMacroRepresentation(profile, props.weight)
    setCarbsRepr(newCarbsRepr)
    setProteinRepr(newProteinRepr)
    setFatRepr(newFatRepr)

    const newTargetCalories = calcCalories(
      calculateMacroTarget(props.weight, profile)
    ).toString()
    setTargetCalories(newTargetCalories)
  })

  const makeOnSetGramsPerKg =
    (macro: 'carbs' | 'protein' | 'fat') => (gramsPerKg: number) => {
      props.onSaveMacroProfile({
        ...profile,
        [`gramsPerKg${macro.charAt(0).toUpperCase() + macro.slice(1)}`]:
          gramsPerKg
      })
    }

  const makeOnSetGrams =
    (macro: 'carbs' | 'protein' | 'fat') => (grams: number) => {
      props.onSaveMacroProfile({
        ...profile,
        [`gramsPerKg${macro.charAt(0).toUpperCase() + macro.slice(1)}`]:
          grams / props.weight
      })
    }

  // TODO: Allow changing percentage directly
  const makeOnSetPercentage =
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (macro: 'carbs' | 'protein' | 'fat') => (percentage: number) => {
      alert(`TODO: set percentage ${percentage} for ${macro} macro`)
    }

  return (
    <>
      <h1 class="mb-6 text-center text-3xl font-bold">
        Meta calórica diária
      </h1>
      <div class="mx-5">
        <input
          value={targetCalories()}
          onChange={setTargetCalories}
          type="search"
          id="default-search"
          class="input-bordered input text-center font-bold"
          style={{ width: '100%' }}
          placeholder="Insira a meta de calorias diárias"
          disabled={true} // TODO: Enable changing target calories directly (and update macros accordingly)
          required
        />
      </div>
      <div class="mx-5 flex flex-col">
        {props.mode === 'edit' && (
          <>
            Perfil atual:{' '}
            <span class="text-green-400">
              Desde {dateToYYYYMMDD(profile.target_day)},{' '}
              {profile.gramsPerKgCarbs}
              g/kg de carboidratos, {profile.gramsPerKgProtein}g/kg de
              proteínas, {profile.gramsPerKgFat}
              g/kg de gorduras
            </span>
            Tem perfil antigo?{' '}
            {oldProfile.hasOldProfile
              ? (
                  'Sim, de ' + dateToYYYYMMDD(oldProfile.target_day)
                )
              : (
              <span class="text-red-500">Não</span>
                )}
            {oldProfile.hasOldProfile && (
              <button
                class="btn btn-primary btn-sm"
                onClick={() => {
                  showConfirmModal({
                    title: (
                      <div class="text-red-500 text-center mb-5 text-xl">
                        {' '}
                        Restaurar perfil antigo{' '}
                      </div>
                    ),
                    body: (
                      <>
                        <MacroTarget
                          weight={props.weight}
                          profiles={props.profiles.filter((p) => p.id !== profile.id)}
                          onSaveMacroProfile={props.onSaveMacroProfile}
                          mode="view"
                        />
                        <div>
                          {`Tem certeza que deseja restaurar o perfil de ${dateToYYYYMMDD(
                            oldProfile.target_day
                          )}?`}
                        </div>
                        <div class="text-red-500 text-center text-lg font-bold">
                          ---- Os dados atuais serão perdidos. ----
                        </div>
                      </>
                    ),
                    actions: [
                      {
                        text: 'Cancelar',
                        onClick: () => undefined
                      },
                      {
                        text: 'Apagar atual e restaurar antigo',
                        primary: true,
                        onClick: () => {
                          deleteMacroProfile(profile.id).then(() => {
                            // router.refresh()
                            alert('TODO: refresh page? probably not')
                          }).catch((e) => {
                            alert('TODO: show error: ' + JSON.stringify(e, null, 2))
                          })
                        }
                      }
                    ]
                  })
                }}
              >
                Restaurar perfil antigo
              </button>
            )}
          </>
        )}
      </div>
      <div class="mx-5 flex flex-col">
        <MacroTargetSetting
          headerColor="text-green-400"
          target={carbsRepr()}
          onSetGramsPerKg={makeOnSetGramsPerKg('carbs')}
          onSetGrams={makeOnSetGrams('carbs')}
          onSetPercentage={makeOnSetPercentage('carbs')}
          mode={props.mode}
        />

        <MacroTargetSetting
          headerColor="text-red-500"
          target={proteinRepr()}
          onSetGramsPerKg={makeOnSetGramsPerKg('protein')}
          onSetGrams={makeOnSetGrams('protein')}
          onSetPercentage={makeOnSetPercentage('protein')}
          mode={props.mode}
        />

        <MacroTargetSetting
          headerColor="text-yellow-500"
          target={fatRepr()}
          onSetGramsPerKg={makeOnSetGramsPerKg('fat')}
          onSetGrams={makeOnSetGrams('fat')}
          onSetPercentage={makeOnSetPercentage('fat')}
          mode={props.mode}
        />
      </div>
    </>
  )
}

function MacroTargetSetting (props: {
  headerColor: string
  target: MacroRepresentation
  onSetPercentage?: (percentage: number) => void
  onSetGrams?: (grams: number) => void
  onSetGramsPerKg?: (gramsPerKg: number) => void
  mode: 'edit' | 'view'
}) {
  const emptyIfZeroElse2Decimals = (value: number) =>
    value === 0 ? '' : value.toFixed(2)

  const percentage = emptyIfZeroElse2Decimals(props.target.percentage * 100)
  const grams = emptyIfZeroElse2Decimals(props.target.grams)
  const gramsPerKg = emptyIfZeroElse2Decimals(props.target.gramsPerKg)

  return (
    <div class="my-2 flex flex-col p-2 border-t border-slate-900">
      <div class="flex flex-col justify-between sm:flex-row gap-0 sm:gap-5 text-center sm:text-start">
        <span class={`text-3xl flex-1 font-bold ${props.headerColor}`}>
          {props.target.name}
          <span class="hidden sm:inline">:</span>
        </span>
        <span class="my-auto flex-1 text-xl">

          {
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          (props.target.calorieMultiplier * (Number(grams) || 0)).toFixed(0)} kcal
          <span class="ml-2 text-slate-300 text-lg">({percentage}%)</span>
        </span>
      </div>
      <div class="mt-5 flex flex-1 flex-shrink flex-col gap-1">
        {/* <MacroField
          fieldName="Porcentagem (%)"
          field={percentage}
          setField={(percentage) => onSetPercentage?.(Number(percentage))}
          unit="%"
          disabled={true}
          className="font-thin italic"
        /> */}

        <div class="flex flex-col md:flex-row gap-5">
          <MacroField
            fieldName="Gramas (g)"
            field={grams}
            setField={(grams) => props.onSetGrams?.(Number(grams))}
            unit="g"
            disabled={props.mode === 'view'}
          />

          <MacroField
            fieldName="Proporção (g/kg)"
            field={gramsPerKg}
            setField={(gramsPerKg) => props.onSetGramsPerKg?.(Number(gramsPerKg))}
            unit="g/kg"
            disabled={props.mode === 'view'}
          />
        </div>
      </div>
    </div>
  )
}

function MacroField (props: {
  fieldName: string
  field: string
  setField: (field: string) => void
  unit: string
  disabled?: boolean
  className?: string
}) {
  const [innerField, setInnerField] = createSignal(props.field)

  createEffect(() => {
    setInnerField(props.field)
  })

  return (
    <div class="flex flex-1 flex-col">
      <div class="">
        <input
          value={innerField()}
          onChange={(e) => setInnerField(e.target.value)}
          onBlur={() => { props.setField(innerField()) }}
          type="number"
          // className={`block text-center w-full p-2 pl-10 text-md bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 ${className || ''}`}
          class="input-bordered input text-center font-bold"
          style={{ width: '100%' }}
          disabled={props.disabled}
          placeholder=""
          required
        />
      </div>
      <div class="my-auto mr-3 text-center">
        <label>{props.fieldName}</label>
      </div>
      {/* <span className="mt-auto">
                {unit}
            </span> */}
    </div>
  )
}
