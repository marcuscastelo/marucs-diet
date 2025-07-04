import { createEffect, createMemo, createSignal, Show } from 'solid-js'

import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  deleteMacroProfile,
  insertMacroProfile,
  updateMacroProfile,
  userMacroProfiles,
} from '~/modules/diet/macro-profile/application/macroProfile'
import {
  createNewMacroProfile,
  type MacroProfile,
} from '~/modules/diet/macro-profile/domain/macroProfile'
import { calculateMacroTarget } from '~/modules/diet/macro-target/application/macroTarget'
import {
  showError,
  showSuccess,
} from '~/modules/toast/application/toastManager'
import { Button } from '~/sections/common/components/buttons/Button'
import {
  closeModal,
  openContentModal,
} from '~/shared/modal/helpers/modalHelpers'
import { dateToYYYYMMDD, getTodayYYYYMMDD } from '~/shared/utils/date/dateUtils'
import { calcCalories } from '~/shared/utils/macroMath'
import { getLatestMacroProfile } from '~/shared/utils/macroProfileUtils'

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

// TODO:   Enable changing target calories directly (and update macros accordingly)
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
  weight: () => number
  profiles: () => readonly MacroProfile[]
  className?: string
  mode: 'edit' | 'view'
}

const onSaveMacroProfile = (profile: MacroProfile) => {
  console.log('[ProfilePage] Saving profile', profile)
  if (profile.target_day.getTime() > new Date(getTodayYYYYMMDD()).getTime()) {
    showError('Data alvo não pode ser no futuro')
    return
  } else if (
    profile.id !== -1 && // TODO:   Better typing system for new MacroProfile instead of -1.
    profile.target_day.getTime() === new Date(getTodayYYYYMMDD()).getTime()
  ) {
    console.log('[ProfilePage] Updating profile', profile)

    // Same day, update
    updateMacroProfile(
      profile.id,
      createNewMacroProfile({
        owner: profile.owner,
        target_day: profile.target_day,
        gramsPerKgCarbs: profile.gramsPerKgCarbs,
        gramsPerKgProtein: profile.gramsPerKgProtein,
        gramsPerKgFat: profile.gramsPerKgFat,
      }),
    ).catch((error) => {
      showError(error, {}, 'Erro ao atualizar perfil de macro')
    })
  } else if (
    profile.id === -1 || // TODO:   Better typing system for new MacroProfile instead of -1.
    profile.target_day.getTime() < new Date(getTodayYYYYMMDD()).getTime()
  ) {
    console.log('[ProfilePage] Inserting profile', profile)

    // Past day, insert with new date
    void insertMacroProfile(
      createNewMacroProfile({
        ...profile,
        target_day: new Date(getTodayYYYYMMDD()),
      }),
    )
  } else {
    showError('Erro imprevisto ao salvar perfil de macro')
  }
}

export function MacroTarget(props: MacroTargetProps) {
  const currentProfile = () => getLatestMacroProfile(props.profiles())
  const oldProfile = () => getLatestMacroProfile(props.profiles(), 1)

  const currentMacroRepresentation = () => {
    const profile_ = currentProfile()
    if (profile_ === null) {
      return calculateMacroRepresentation(
        {
          gramsPerKgCarbs: 0,
          gramsPerKgFat: 0,
          gramsPerKgProtein: 0,
        },
        0,
      )
    }
    return calculateMacroRepresentation(profile_, props.weight())
  }

  const targetCalories = createMemo(() => {
    const profile_ = currentProfile()
    if (profile_ === null) {
      return 'Sem meta, preencha os campos abaixo'
    }

    const grams = calculateMacroTarget(props.weight(), profile_)
    const calories = Math.round(calcCalories(grams) * 100) / 100
    return calories.toString() + ' kcal'
  })

  return (
    <>
      <h1 class="mb-6 text-center text-3xl font-bold">Meta calórica diária</h1>
      A: {userMacroProfiles().length}
      <div class="mx-5">
        <input
          value={targetCalories()}
          type="search"
          id="default-search"
          class="input text-center font-bold"
          style={{ width: '100%' }}
          placeholder="Insira a meta de calorias diárias"
          disabled={true} // TODO:   Enable changing target calories directly (and update macros accordingly).
          required
        />
      </div>
      <Show when={currentProfile()}>
        {(profile) => (
          <>
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
                  >
                    {(oldProfile) => (
                      <>
                        <span class="text-center">
                          Tem perfil antigo?{' '}
                          {'Sim, de ' + dateToYYYYMMDD(oldProfile().target_day)}
                        </span>
                        <Button
                          class="btn-primary btn-sm"
                          onClick={() => {
                            const modalId = openContentModal(
                              () => (
                                <>
                                  <div class="text-red-500 text-center mb-5 text-xl">
                                    Restaurar perfil antigo
                                  </div>
                                  <MacroTarget
                                    weight={props.weight}
                                    profiles={() =>
                                      props
                                        .profiles()
                                        .filter((p) => p.id !== profile().id)
                                    }
                                    mode="view"
                                  />
                                  <div class="mb-4">
                                    {`Tem certeza que deseja restaurar o perfil de ${dateToYYYYMMDD(
                                      oldProfile().target_day,
                                    )}?`}
                                  </div>
                                  <div class="text-red-500 text-center text-lg font-bold mb-6">
                                    ---- Os dados atuais serão perdidos. ----
                                  </div>
                                </>
                              ),
                              {
                                title: 'Restaurar perfil antigo',
                                footer: () => (
                                  <div class="flex gap-2 justify-end">
                                    <button
                                      type="button"
                                      class="btn btn-ghost"
                                      onClick={() => {
                                        closeModal(modalId)
                                      }}
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      class="btn btn-primary"
                                      onClick={() => {
                                        deleteMacroProfile(profile().id)
                                          .then(() => {
                                            showSuccess(
                                              'Perfil antigo restaurado com sucesso, se necessário, atualize a página',
                                            )
                                            closeModal(modalId)
                                          })
                                          .catch((e) => {
                                            showError(
                                              e,
                                              undefined,
                                              'Erro ao restaurar perfil antigo',
                                            )
                                          })
                                      }}
                                    >
                                      Apagar atual e restaurar antigo
                                    </button>
                                  </div>
                                ),
                              },
                            )
                          }}
                        >
                          Restaurar perfil antigo
                        </Button>
                      </>
                    )}
                  </Show>
                </>
              )}
            </div>

            <div class="mx-5 flex flex-col">
              <MacroTargetSetting
                headerColor="text-green-400"
                currentProfile={profile()}
                weight={props.weight()}
                target={currentMacroRepresentation().carbs}
                field="carbs"
                mode={props.mode}
              />

              <MacroTargetSetting
                headerColor="text-red-500"
                currentProfile={profile()}
                weight={props.weight()}
                target={currentMacroRepresentation().protein}
                field="protein"
                mode={props.mode}
              />

              <MacroTargetSetting
                headerColor="text-yellow-500"
                currentProfile={profile()}
                weight={props.weight()}
                target={currentMacroRepresentation().fat}
                field="fat"
                mode={props.mode}
              />
            </div>
          </>
        )}
      </Show>
    </>
  )
}

function MacroTargetSetting(props: {
  headerColor: string
  currentProfile: MacroProfile
  weight: number
  target: MacroRepresentation
  field: keyof MacroNutrients
  mode: 'edit' | 'view'
}) {
  const emptyIfZeroElse2Decimals = (value: number) =>
    value === 0 ? '' : value.toFixed(2)

  const percentage = () =>
    emptyIfZeroElse2Decimals(props.target.percentage * 100)
  const grams = () => emptyIfZeroElse2Decimals(props.target.grams)
  const gramsPerKg = () => emptyIfZeroElse2Decimals(props.target.gramsPerKg)

  const onSetGramsPerKg = (gramsPerKg: number) => {
    const profile_ = props.currentProfile

    onSaveMacroProfile({
      ...profile_,
      [`gramsPerKg${props.field.charAt(0).toUpperCase() + props.field.slice(1)}`]:
        gramsPerKg,
    })
  }

  const onSetGrams = (grams: number) => {
    const profile_ = props.currentProfile

    onSaveMacroProfile({
      ...profile_,
      [`gramsPerKg${props.field.charAt(0).toUpperCase() + props.field.slice(1)}`]:
        grams / props.weight,
    })
  }

  // TODO:   Allow changing percentage directly
  // const makeOnSetPercentage =
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   (macro: 'carbs' | 'protein' | 'fat') => (percentage: number) => {
  //     showError('Direct percentage change not yet implemented', {context: 'user-action'})
  //   }

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
          {(props.target.calorieMultiplier * (Number(grams) || 0)).toFixed(0)}{' '}
          kcal
          <span class="ml-2 text-slate-300 text-lg">({percentage()}%)</span>
        </span>
      </div>
      <div class="mt-5 flex flex-1 shrink flex-col gap-1">
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
            setField={(grams) => {
              onSetGrams(Number(grams))
            }}
            unit="g"
            disabled={props.mode === 'view'}
          />

          <MacroField
            fieldName="Proporção (g/kg)"
            field={gramsPerKg()}
            setField={(gramsPerKg) => {
              onSetGramsPerKg(Number(gramsPerKg))
            }}
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
          class="input text-center font-bold"
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
