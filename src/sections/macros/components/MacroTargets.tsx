'use client'

import { useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { deleteMacroProfile } from '@/controllers/macroProfiles'
import { MacroNutrients } from '@/model/macroNutrientsModel'
import { MacroProfile } from '@/model/macroProfileModel'
import { dateToYYYYMMDD } from '@/utils/dateUtils'
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
  mode: 'edit' | 'view'
}

export function MacroTarget({
  weight,
  profiles,
  onSaveMacroProfile,
  mode,
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
      alert('TODO: future feature') // TODO: Change all alerts with ConfirmModal
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
        {mode === 'edit' && (
          <>
            Perfil atual:{' '}
            <span className="text-green-400">
              Desde {dateToYYYYMMDD(profile.target_day)},{' '}
              {profile.gramsPerKgCarbs}
              g/kg de carboidratos, {profile.gramsPerKgProtein}g/kg de
              proteínas, {profile.gramsPerKgFat}
              g/kg de gorduras
            </span>
            Tem perfil antigo?{' '}
            {oldProfile.hasOldProfile ? (
              'Sim, de ' + dateToYYYYMMDD(oldProfile.target_day)
            ) : (
              <span className="text-red-500">Não</span>
            )}
            {oldProfile.hasOldProfile && (
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  showConfirmModal({
                    title: (
                      <div className="text-red-500 text-center mb-5 text-xl">
                        {' '}
                        Restaurar perfil antigo{' '}
                      </div>
                    ),
                    body: (
                      <>
                        <MacroTarget
                          weight={weight}
                          profiles={profiles.filter((p) => p.id !== profile.id)}
                          onSaveMacroProfile={onSaveMacroProfile}
                          mode="view"
                        />
                        <div>
                          {`Tem certeza que deseja restaurar o perfil de ${dateToYYYYMMDD(
                            oldProfile.target_day,
                          )}?`}
                        </div>
                        <div className="text-red-500 text-center text-lg font-bold">
                          ---- Os dados atuais serão perdidos. ----
                        </div>
                      </>
                    ),
                    actions: [
                      {
                        text: 'Cancelar',
                        onClick: () => undefined,
                      },
                      {
                        text: 'Apagar atual e restaurar antigo',
                        primary: true,
                        onClick: async () => {
                          await deleteMacroProfile(profile.id)
                          router.refresh()
                        },
                      },
                    ],
                  })
                }}
              >
                Restaurar perfil antigo
              </button>
            )}
          </>
        )}
      </div>
      <div className="mx-5 flex flex-col">
        <MacroTargetSetting
          headerColor="text-green-400"
          target={carbsRepr}
          onSetGramsPerKg={makeOnSetGramsPerKg('carbs')}
          onSetGrams={makeOnSetGrams('carbs')}
          onSetPercentage={makeOnSetPercentage('carbs')}
          mode={mode}
        />

        <MacroTargetSetting
          headerColor="text-red-500"
          target={proteinRepr}
          onSetGramsPerKg={makeOnSetGramsPerKg('protein')}
          onSetGrams={makeOnSetGrams('protein')}
          onSetPercentage={makeOnSetPercentage('protein')}
          mode={mode}
        />

        <MacroTargetSetting
          headerColor="text-yellow-500"
          target={fatRepr}
          onSetGramsPerKg={makeOnSetGramsPerKg('fat')}
          onSetGrams={makeOnSetGrams('fat')}
          onSetPercentage={makeOnSetPercentage('fat')}
          mode={mode}
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
  mode,
}: {
  headerColor: string
  target: MacroRepresentation
  onSetPercentage?: (percentage: number) => void
  onSetGrams?: (grams: number) => void
  onSetGramsPerKg?: (gramsPerKg: number) => void
  mode: 'edit' | 'view'
}) {
  const emptyIfZeroElse2Decimals = (value: number) =>
    (value && value.toFixed(2)) || ''

  const percentage = emptyIfZeroElse2Decimals(target.percentage * 100)
  const grams = emptyIfZeroElse2Decimals(target.grams)
  const gramsPerKg = emptyIfZeroElse2Decimals(target.gramsPerKg)

  return (
    <div className="my-2 flex flex-col p-2 border-t border-slate-900">
      <div className="flex flex-col justify-between sm:flex-row gap-0 sm:gap-5 text-center sm:text-start">
        <span className={`text-3xl flex-1 font-bold ${headerColor}`}>
          {target.name}
          <span className="hidden sm:inline">:</span>
        </span>
        <span className="my-auto flex-1 text-xl">
          {(target.calorieMultiplier * (Number(grams) || 0)).toFixed(0)} kcal
          <span className="ml-2 text-slate-300 text-lg">({percentage}%)</span>
        </span>
      </div>
      <div className="mt-5 flex flex-1 flex-shrink flex-col gap-1">
        {/* <MacroField
          fieldName="Porcentagem (%)"
          field={percentage}
          setField={(percentage) => onSetPercentage?.(Number(percentage))}
          unit="%"
          disabled={true}
          className="font-thin italic"
        /> */}

        <div className="flex flex-col md:flex-row gap-5">
          <MacroField
            fieldName="Gramas (g)"
            field={grams}
            setField={(grams) => onSetGrams?.(Number(grams))}
            unit="g"
            disabled={mode === 'view'}
          />

          <MacroField
            fieldName="Proporção (g/kg)"
            field={gramsPerKg}
            setField={(gramsPerKg) => onSetGramsPerKg?.(Number(gramsPerKg))}
            unit="g/kg"
            disabled={mode === 'view'}
          />
        </div>
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
    <div className="flex flex-1 flex-col">
      <div className="">
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
      <div className="my-auto mr-3 text-center">
        <label>{fieldName}</label>
      </div>
      {/* <span className="mt-auto">
                {unit}
            </span> */}
    </div>
  )
}
