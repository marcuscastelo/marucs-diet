import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { type MacroProfile } from '~/modules/diet/macro-profile/domain/macroProfile'
import { dateToYYYYMMDD, stringToDate } from '~/legacy/utils/dateUtils'
import { calcCalories } from '~/legacy/utils/macroMath'
import { getLatestMacroProfile } from '~/legacy/utils/macroProfileUtils'
import { Show, createEffect, createSignal, untrack } from 'solid-js'
import { deleteMacroProfile } from '~/modules/diet/macro-profile/application/macroProfile'
import { createMirrorSignal } from '~/sections/common/hooks/createMirrorSignal'
import { calculateMacroTarget } from '~/modules/diet/macro-target/application/macroTarget'
import toast from 'solid-toast'
import { generateId } from '~/legacy/utils/idUtils'
import { currentUserId } from '~/modules/user/application/user'
import { targetDay } from '~/modules/diet/day-diet/application/dayDiet'

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

const calculateMacroRepresentation = (
  profile: Pick<
    MacroProfile,
    'gramsPerKgCarbs' | 'gramsPerKgFat' | 'gramsPerKgProtein'
  >,
  weight: number,
) => {
  const targetGrams = calculateMacroTarget(weight, profile)
  const calories = calcCalories(targetGrams)

  return {
    carbs: {
      name: 'Carboidratos',
      percentage: (targetGrams.carbs * 4) / calories,
      grams: targetGrams.carbs,
      gramsPerKg: profile.gramsPerKgCarbs,
      calorieMultiplier: CARBO_CALORIES,
    },
    protein: {
      name: 'Proteínas',
      percentage: (targetGrams.protein * 4) / calories,
      grams: targetGrams.protein,
      gramsPerKg: profile.gramsPerKgProtein,
      calorieMultiplier: PROTEIN_CALORIES,
    },
    fat: {
      name: 'Gorduras',
      percentage: (targetGrams.fat * 9) / calories,
      grams: targetGrams.fat,
      gramsPerKg: profile.gramsPerKgFat,
      calorieMultiplier: FAT_CALORIES,
    },
  }
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
  profiles: () => readonly MacroProfile[]
  className?: string
  onSaveMacroProfile: (newProfile: MacroProfile) => void
  mode: 'edit' | 'view'
}

export function MacroTarget(props: MacroTargetProps) {
  const { show: showConfirmModal } = useConfirmModalContext()
  const profile = () => getLatestMacroProfile(props.profiles())
  const oldProfile = () => getLatestMacroProfile(props.profiles(), 1)

  const [targetCalories, setTargetCalories] = createMirrorSignal(() => {
    const profile_ = profile()
    if (profile_ === null) {
      return 'Sem meta, preencha os campos abaixo'
    }

    const grams = calculateMacroTarget(props.weight, profile_)
    const calories = Math.round(calcCalories(grams) * 100) / 100
    return calories.toString() + ' kcal'
  })

  const carbsRepr = () => {
    const profile_ = profile()
    if (profile_ === null) {
      return calculateMacroRepresentation(
        {
          gramsPerKgCarbs: 0,
          gramsPerKgFat: 0,
          gramsPerKgProtein: 0,
        },
        0,
      ).carbs
    }
    return calculateMacroRepresentation(profile_, props.weight).carbs
  }
  const proteinRepr = () => {
    const profile_ = profile()
    if (profile_ === null) {
      return calculateMacroRepresentation(
        {
          gramsPerKgCarbs: 0,
          gramsPerKgFat: 0,
          gramsPerKgProtein: 0,
        },
        0,
      ).protein
    }
    return calculateMacroRepresentation(profile_, props.weight).protein
  }
  const fatRepr = () => {
    const profile_ = profile()
    if (profile_ === null) {
      return calculateMacroRepresentation(
        {
          gramsPerKgCarbs: 0,
          gramsPerKgFat: 0,
          gramsPerKgProtein: 0,
        },
        0,
      ).fat
    }
    return calculateMacroRepresentation(profile_, props.weight).fat
  }

  const onSaveMacroProfile = (newProfile: MacroProfile) => {
    props.onSaveMacroProfile(newProfile)
  }

  // TODO: Move to macroProfile module
  const createNewMacroProfile = () => ({
    id: -1,
    owner: currentUserId(),
    target_day: stringToDate(targetDay()),
    gramsPerKgCarbs: 0,
    gramsPerKgProtein: 0,
    gramsPerKgFat: 0,
  })

  const makeOnSetGramsPerKg =
    (macro: 'carbs' | 'protein' | 'fat') => (gramsPerKg: number) => {
      const profile_ = untrack(profile) ?? createNewMacroProfile()
      onSaveMacroProfile({
        ...profile_,
        [`gramsPerKg${macro.charAt(0).toUpperCase() + macro.slice(1)}`]:
          gramsPerKg,
      })
    }

  const makeOnSetGrams =
    (macro: 'carbs' | 'protein' | 'fat') => (grams: number) => {
      const profile_ = untrack(profile) ?? createNewMacroProfile()
      onSaveMacroProfile({
        ...profile_,
        [`gramsPerKg${macro.charAt(0).toUpperCase() + macro.slice(1)}`]:
          grams / props.weight,
      })
    }

  // TODO: Allow changing percentage directly
  const makeOnSetPercentage =
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (macro: 'carbs' | 'protein' | 'fat') => (percentage: number) => {
      toast.error('Alterar porcentagem diretamente ainda não implementado')
    }

  return (
    <>
      <h1 class="mb-6 text-center text-3xl font-bold">Meta calórica diária</h1>
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
      <Show when={profile()} keyed>
        {(profile) => (
          <div class="mx-5 flex flex-col">
            {props.mode === 'edit' && (
              <>
                <Show
                  when={oldProfile()}
                  fallback={
                    <span class="text-center">
                      Tem perfil antigo? <span class="text-red-500">Não</span>
                    </span>
                  }
                  keyed
                >
                  {(oldProfile) => (
                    <>
                      <span class="text-center">
                        Tem perfil antigo?{' '}
                        {'Sim, de ' + dateToYYYYMMDD(oldProfile.target_day)}
                      </span>
                      <button
                        class="btn btn-primary btn-sm"
                        onClick={() => {
                          showConfirmModal({
                            title: () => (
                              <div class="text-red-500 text-center mb-5 text-xl">
                                {' '}
                                Restaurar perfil antigo{' '}
                              </div>
                            ),
                            body: () => (
                              <>
                                <MacroTarget
                                  weight={props.weight}
                                  profiles={() =>
                                    props
                                      .profiles()
                                      .filter((p) => p.id !== profile.id)
                                  }
                                  onSaveMacroProfile={props.onSaveMacroProfile}
                                  mode="view"
                                />
                                <div>
                                  {`Tem certeza que deseja restaurar o perfil de ${dateToYYYYMMDD(
                                    oldProfile.target_day,
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
                                onClick: () => undefined,
                              },
                              {
                                text: 'Apagar atual e restaurar antigo',
                                primary: true,
                                onClick: () => {
                                  deleteMacroProfile(profile.id)
                                    .then(() => {
                                      // router.refresh()
                                      // TODO: refresh page? probably not
                                      toast.success(
                                        'Perfil antigo restaurado com sucesso, se necessário, atualize a página',
                                      )
                                    })
                                    .catch((e) => {
                                      toast.error(
                                        'Erro ao apagar perfil atual: \n' +
                                          JSON.stringify(e, null, 2),
                                      )
                                    })
                                },
                              },
                            ],
                          })
                        }}
                      >
                        Restaurar perfil antigo
                      </button>
                    </>
                  )}
                </Show>
              </>
            )}
          </div>
        )}
      </Show>
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

function MacroTargetSetting(props: {
  headerColor: string
  target: MacroRepresentation
  onSetPercentage?: (percentage: number) => void
  onSetGrams?: (grams: number) => void
  onSetGramsPerKg?: (gramsPerKg: number) => void
  mode: 'edit' | 'view'
}) {
  const emptyIfZeroElse2Decimals = (value: number) =>
    value === 0 ? '' : value.toFixed(2)

  const percentage = () =>
    emptyIfZeroElse2Decimals(props.target.percentage * 100)
  const grams = () => emptyIfZeroElse2Decimals(props.target.grams)
  const gramsPerKg = () => emptyIfZeroElse2Decimals(props.target.gramsPerKg)

  return (
    <div class="my-2 flex flex-col p-2 border-t border-slate-900">
      <div class="flex flex-col justify-between sm:flex-row gap-0 sm:gap-5 text-center sm:text-start">
        <span
          class={`text-3xl text-center flex-1 font-bold ${props.headerColor}`}
        >
          {props.target.name}
          <span class="hidden sm:inline">:</span>
        </span>
        <span class="my-auto flex-1 text-xl text-center">
          {
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            (props.target.calorieMultiplier * (Number(grams) || 0)).toFixed(0)
          }{' '}
          kcal
          <span class="ml-2 text-slate-300 text-lg">({percentage()}%)</span>
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
            field={grams()}
            setField={(grams) => props.onSetGrams?.(Number(grams))}
            unit="g"
            disabled={props.mode === 'view'}
          />

          <MacroField
            fieldName="Proporção (g/kg)"
            field={gramsPerKg()}
            setField={(gramsPerKg) =>
              props.onSetGramsPerKg?.(Number(gramsPerKg))
            }
            unit="g/kg"
            disabled={props.mode === 'view'}
          />
        </div>
      </div>
    </div>
  )
}

function MacroField(props: {
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
          onBlur={() => {
            props.setField(innerField())
          }}
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
