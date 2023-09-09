'use client'

import { useConfirmModalContext } from '@/context/confirmModal.context'
import { deleteMacroProfile } from '@/controllers/macroProfiles'
import { MacroNutrients } from '@/model/macroNutrientsModel'
import { MacroProfile } from '@/model/macroProfileModel'
import { dateToDateString } from '@/utils/dateUtils'
import { calcCalories } from '@/utils/macroMath'
import { latestMacroProfile } from '@/utils/macroProfileUtils'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  savedMacroTarget: MacroProfile,
): MacroNutrients => ({
  carbs: weight * savedMacroTarget.gramsPerKgCarbs,
  protein: weight * savedMacroTarget.gramsPerKgProtein,
  fat: weight * savedMacroTarget.gramsPerKgFat,
})

const calculateMacroRepresentation = (
  profile: MacroProfile,
  weight: number,
): MacroRepresentation[] => {
  const targetGrams = calculateMacroTarget(weight, profile)
  const calories = calcCalories(targetGrams)

  return [
    {
      name: 'Carboidratos',
      percentage: (targetGrams.carbs * 4) / calories,
      grams: targetGrams.carbs,
      gramsPerKg: profile.gramsPerKgCarbs,
      calorieMultiplier: CARBO_CALORIES,
    },
    {
      name: 'Proteínas',
      percentage: (targetGrams.protein * 4) / calories,
      grams: targetGrams.protein,
      gramsPerKg: profile.gramsPerKgProtein,
      calorieMultiplier: PROTEIN_CALORIES,
    },
    {
      name: 'Gorduras',
      percentage: (targetGrams.fat * 9) / calories,
      grams: targetGrams.fat,
      gramsPerKg: profile.gramsPerKgFat,
      calorieMultiplier: FAT_CALORIES,
    },
  ]
}

// TODO: Enable changing target calories directly (and update macros accordingly)
const calculateDifferenceInCarbs = (
  targetCalories: number,
  weight: number,
  currentProfile: MacroProfile,
): number => {
  const currentCalories = calcCalories(
    calculateMacroTarget(weight, currentProfile),
  )
  return (targetCalories - currentCalories) / CARBO_CALORIES
}

export type MacroTargetProps = {
  weight: number
  profiles: MacroProfile[]
  className?: string
  onSaveMacroProfile: (newProfile: MacroProfile) => void
}

export function MacroTarget({
  weight,
  profiles,
  onSaveMacroProfile,
}: MacroTargetProps) {
  const router = useRouter()
  const { show: showConfirmModal } = useConfirmModalContext()
  const profile = latestMacroProfile(profiles)
  const oldProfile_ = latestMacroProfile(profiles, 1)
  const oldProfile = oldProfile_
    ? {
        hasOldProfile: true as const,
        ...oldProfile_,
      }
    : ({
        hasOldProfile: false,
      } as const)

  if (!profile) {
    throw new Error('No macro profile found')
  }

  const initialGrams = calculateMacroTarget(weight, profile)
  const initialCalories = calcCalories(initialGrams)
  const [initialCarbsRepr, initialProteinRepr, initialFatRepr] =
    calculateMacroRepresentation(profile, weight)

  const [targetCalories, setTargetCalories] = useState(
    initialCalories.toString(),
  )

  const [carbsRepr, setCarbsRepr] =
    useState<MacroRepresentation>(initialCarbsRepr)
  const [proteinRepr, setProteinRepr] =
    useState<MacroRepresentation>(initialProteinRepr)
  const [fatRepr, setFatRepr] = useState<MacroRepresentation>(initialFatRepr)

  useEffect(() => {
    const [carbsRepr, proteinRepr, fatRepr] = calculateMacroRepresentation(
      profile,
      weight,
    )
    setCarbsRepr(carbsRepr)
    setProteinRepr(proteinRepr)
    setFatRepr(fatRepr)

    const targetCalories = calcCalories(calculateMacroTarget(weight, profile))
    setTargetCalories(targetCalories.toString())
  }, [profile, weight])

  const makeOnSetGramsPerKg =
    (macro: 'carbs' | 'protein' | 'fat') => (gramsPerKg: number) =>
      onSaveMacroProfile({
        ...profile,
        [`gramsPerKg${macro.charAt(0).toUpperCase() + macro.slice(1)}`]:
          gramsPerKg,
      })

  const makeOnSetGrams =
    (macro: 'carbs' | 'protein' | 'fat') => (grams: number) =>
      onSaveMacroProfile({
        ...profile,
        [`gramsPerKg${macro.charAt(0).toUpperCase() + macro.slice(1)}`]:
          grams / weight,
      })

  // TODO: Allow changing percentage directly
  const makeOnSetPercentage =
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (macro: 'carbs' | 'protein' | 'fat') => (percentage: number) => {
      alert('TODO: future feature')
    }

  return (
    <>
      <h1 className="mb-6 text-center text-3xl font-bold">
        Meta calórica diária
      </h1>
      <div className="mx-5">
        <input
          value={targetCalories}
          onChange={(e) => setTargetCalories(e.target.value)}
          type="search"
          id="default-search"
          className="input-bordered input text-center font-bold"
          style={{ width: '100%' }}
          placeholder="Insira a meta de calorias diárias"
          disabled={true} // TODO: Enable changing target calories directly (and update macros accordingly)
          required
        />
      </div>
      <div className="mx-5 flex flex-col">
        Perfil atual:{' '}
        <span className="text-green-400">
          Desde {dateToDateString(profile.target_day)},{' '}
          {profile.gramsPerKgCarbs}
          g/kg de carboidratos, {profile.gramsPerKgProtein}g/kg de proteínas,{' '}
          {profile.gramsPerKgFat}
          g/kg de gorduras
        </span>
        Tem perfil antigo?{' '}
        {oldProfile.hasOldProfile ? (
          'Sim, de ' + dateToDateString(oldProfile.target_day)
        ) : (
          <span className="text-red-500">Não</span>
        )}
        {oldProfile.hasOldProfile && (
          <button
            className="btn btn-primary btn-sm"
            onClick={async () => {
              showConfirmModal({
                title: 'Restaurar perfil antigo',
                message: `Tem certeza que deseja restaurar o perfil de ${dateToDateString(
                  oldProfile.target_day,
                )}? Os dados atuais serão perdidos.`,
                onConfirm: async () => {
                  await deleteMacroProfile(profile.id)
                  router.refresh()
                },
              })
            }}
          >
            Restaurar perfil antigo
          </button>
        )}
      </div>
      <div className="mx-5 flex flex-col">
        <MacroTargetSetting
          headerColor="text-green-400"
          target={carbsRepr}
          onSetGramsPerKg={makeOnSetGramsPerKg('carbs')}
          onSetGrams={makeOnSetGrams('carbs')}
          onSetPercentage={makeOnSetPercentage('carbs')}
        />

        <MacroTargetSetting
          headerColor="text-red-500"
          target={proteinRepr}
          onSetGramsPerKg={makeOnSetGramsPerKg('protein')}
          onSetGrams={makeOnSetGrams('protein')}
          onSetPercentage={makeOnSetPercentage('protein')}
        />

        <MacroTargetSetting
          headerColor="text-yellow-500"
          target={fatRepr}
          onSetGramsPerKg={makeOnSetGramsPerKg('fat')}
          onSetGrams={makeOnSetGrams('fat')}
          onSetPercentage={makeOnSetPercentage('fat')}
        />
      </div>
    </>
  )
}

function MacroTargetSetting({
  headerColor,
  target,
  onSetPercentage,
  onSetGrams,
  onSetGramsPerKg,
}: {
  headerColor: string
  target: MacroRepresentation
  onSetPercentage?: (percentage: number) => void
  onSetGrams?: (grams: number) => void
  onSetGramsPerKg?: (gramsPerKg: number) => void
}) {
  const emptyIfZeroElse2Decimals = (value: number) =>
    (value && value.toFixed(2)) || ''

  const percentage = emptyIfZeroElse2Decimals(target.percentage * 100)
  const grams = emptyIfZeroElse2Decimals(target.grams)
  const gramsPerKg = emptyIfZeroElse2Decimals(target.gramsPerKg)

  return (
    <div className="my-2 flex flex-col p-2 outline outline-slate-900">
      <div className="block flex-1 text-center">
        <h1 className={`mt-6 text-3xl font-bold ${headerColor}`}>
          {target.name}
        </h1>
        <div className="mt-1 text-center">
          {(target.calorieMultiplier * (Number(grams) || 0)).toFixed(0)} kcal
        </div>
      </div>
      <div className="mt-5 flex flex-1 flex-shrink flex-col gap-1">
        <MacroField
          fieldName="Porcentagem (%)"
          field={percentage}
          setField={(percentage) => onSetPercentage?.(Number(percentage))}
          unit="%"
          disabled={true}
          className="font-thin italic"
        />

        <MacroField
          fieldName="Gramas (g)"
          field={grams}
          setField={(grams) => onSetGrams?.(Number(grams))}
          unit="g"
        />

        <MacroField
          fieldName="Proporção (g/kg)"
          field={gramsPerKg}
          setField={(gramsPerKg) => onSetGramsPerKg?.(Number(gramsPerKg))}
          unit="g/kg"
        />
      </div>
    </div>
  )
}

function MacroField({
  fieldName,
  field,
  setField,
  disabled,
}: {
  fieldName: string
  field: string
  setField: (field: string) => void
  unit: string
  disabled?: boolean
  className?: string
}) {
  const [innerField, setInnerField] = useState(field)

  useEffect(() => {
    setInnerField(field)
  }, [field])

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <div className="my-auto mr-3 text-center md:w-1/3 md:text-end">
        <label>{fieldName}</label>
      </div>
      <div className="md:w-2/3">
        <input
          value={innerField}
          onChange={(e) => setInnerField(e.target.value)}
          onBlur={() => setField(innerField)}
          type="number"
          // className={`block text-center w-full p-2 pl-10 text-md bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 ${className || ''}`}
          className="input-bordered input text-center font-bold"
          style={{ width: '100%' }}
          disabled={disabled}
          placeholder=""
          required
        />
      </div>
      {/* <span className="mt-auto">
                {unit}
            </span> */}
    </div>
  )
}
