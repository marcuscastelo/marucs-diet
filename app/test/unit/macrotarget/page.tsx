'use client'

import MacroTarget, {
  MacroProfile,
  MacroRepresentation,
} from '@/app/MacroTargets'
import { MacroNutrientsData } from '@/model/macroNutrientsModel'
import { useEffect, useState } from 'react'

const CARBO_CALORIES = 4 as const
const PROTEIN_CALORIES = 4 as const
const FAT_CALORIES = 9 as const

const calculateMacroTarget = (
  weight: number,
  savedMacroTarget: MacroProfile,
): MacroNutrientsData => ({
  carbs: weight * savedMacroTarget.gramsPerKgCarbs,
  protein: weight * savedMacroTarget.gramsPerKgProtein,
  fat: weight * savedMacroTarget.gramsPerKgFat,
})

const calculateCalories = (targetGrams: MacroNutrientsData): number =>
  targetGrams.carbs * 4 + targetGrams.protein * 4 + targetGrams.fat * 9

const calculateMacroRepresentation = (
  profile: MacroProfile,
  weight: number,
): MacroRepresentation[] => {
  const targetGrams = calculateMacroTarget(weight, profile)
  const calories = calculateCalories(targetGrams)

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

const calculateDifferenceInCarbs = (
  targetCalories: number,
  weight: number,
  currentProfile: MacroProfile,
): number => {
  const currentCalories = calculateCalories(
    calculateMacroTarget(weight, currentProfile),
  )
  return (targetCalories - currentCalories) / CARBO_CALORIES
}

export default function Page() {
  const weight = 100
  const initialProfile: MacroProfile = {
    gramsPerKgCarbs: 2,
    gramsPerKgProtein: 2,
    gramsPerKgFat: 1,
  }

  return (
    <MacroTarget
      weight={weight}
      profile={initialProfile}
      onSaveMacroProfile={() => alert('Save profile')}
    />
  )
  // TODO: Check code below

  const initialGrams = calculateMacroTarget(weight, initialProfile)
  const initialCalories = calculateCalories(initialGrams)
  const [initialCarbRepr, initialProteinRepr, initialFatRepr] =
    calculateMacroRepresentation(initialProfile, weight)

  const [profile, setProfile] = useState(initialProfile)
  const [targetCalories, setTargetCalories] = useState(
    initialCalories.toString(),
  )

  const [carbRepr, setCarbRepr] = useState<MacroRepresentation>(initialCarbRepr)
  const [proteinRepr, setProteinRepr] =
    useState<MacroRepresentation>(initialProteinRepr)
  const [fatRepr, setFatRepr] = useState<MacroRepresentation>(initialFatRepr)

  useEffect(() => {
    const [carbRepr, proteinRepr, fatRepr] = calculateMacroRepresentation(
      profile,
      weight,
    )
    setCarbRepr(carbRepr)
    setProteinRepr(proteinRepr)
    setFatRepr(fatRepr)

    const targetCalories = calculateCalories(
      calculateMacroTarget(weight, profile),
    )
    setTargetCalories(targetCalories.toString())
  }, [profile])

  const makeOnSetGramsPerKg =
    (macro: 'carb' | 'protein' | 'fat') => (gramsPerKg: number) =>
      setProfile((profile) => ({
        ...profile,
        [`gramsPerKg${macro.charAt(0).toUpperCase() + macro.slice(1)}`]:
          gramsPerKg,
      }))

  const makeOnSetGrams =
    (macro: 'carb' | 'protein' | 'fat') => (grams: number) =>
      setProfile((profile) => ({
        ...profile,
        [`gramsPerKg${macro.charAt(0).toUpperCase() + macro.slice(1)}`]:
          grams / weight,
      }))

  const makeOnSetPercentage =
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (macro: 'carb' | 'protein' | 'fat') => (percentage: number) => {
      alert('TODO: future feature')
    }

  return (
    <div className="mx-auto w-1/4">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Meta calórica diária
      </h1>
      <input
        value={targetCalories}
        onChange={(e) => setTargetCalories(e.target.value)}
        type="search"
        id="default-search"
        className="text-md block w-full border-gray-600 bg-gray-700 p-2 pl-10 text-center font-thin italic text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
        placeholder="Insira a meta de calorias diárias"
        disabled={true} // TODO: retriggered: future feature
        required
      />

      <MacroTargetSetting
        headerColor="text-green-500"
        target={carbRepr}
        onSetGramsPerKg={makeOnSetGramsPerKg('carb')}
        onSetGrams={makeOnSetGrams('carb')}
        onSetPercentage={makeOnSetPercentage('carb')}
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

  const percentage = emptyIfZeroElse2Decimals(target.percentage)
  const grams = emptyIfZeroElse2Decimals(target.grams)
  const gramsPerKg = emptyIfZeroElse2Decimals(target.gramsPerKg)

  return (
    <>
      <h1 className={`my-6 text-center text-3xl font-bold ${headerColor}`}>
        {target.name}
      </h1>

      <div className="flex gap-10 ">
        <MacroField
          field={percentage}
          setField={(percentage) => onSetPercentage?.(Number(percentage))}
          unit="%"
          disabled={true}
          className="font-thin italic"
        />

        <MacroField
          field={grams}
          setField={(grams) => onSetGrams?.(Number(grams))}
          unit="g"
        />

        <MacroField
          field={gramsPerKg}
          setField={(gramsPerKg) => onSetGramsPerKg?.(Number(gramsPerKg))}
          unit="g/kg"
        />
      </div>
      <div className="mt-3 text-center">
        {(target.calorieMultiplier * (Number(grams) || 0)).toFixed(0)} kcal
        {/* RERENDER: {Math.random().toString().slice(0, 5)} */}
      </div>
    </>
  )
}

function MacroField({
  field,
  setField,
  unit,
  disabled,
  className,
}: {
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
    <div className="flex flex-1 gap-1">
      <input
        value={innerField}
        onChange={(e) => setInnerField(e.target.value)}
        onBlur={() => setField(innerField)}
        type="number"
        className={`text-md block w-full border-gray-600 bg-gray-700 p-2 pl-10 text-center text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 ${
          className || ''
        }`}
        disabled={disabled}
        placeholder=""
        required
      />
      <span className="mt-auto">{unit}</span>
    </div>
  )
}
