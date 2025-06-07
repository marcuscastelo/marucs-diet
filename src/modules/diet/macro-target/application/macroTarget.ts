import { inForceWeight } from '~/legacy/utils/weightUtils'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import { type MacroProfile } from '~/modules/diet/macro-profile/domain/macroProfile'
import { userWeights } from '~/modules/weight/application/weight'
import { inForceMacroProfile } from '~/legacy/utils/macroProfileUtils'
import { userMacroProfiles } from '~/modules/diet/macro-profile/application/macroProfile'
import { showError } from '~/modules/toast/application/toastManager'

export const calculateMacroTarget = (
  weight: number,
  savedMacroTarget: Pick<
    MacroProfile,
    'gramsPerKgCarbs' | 'gramsPerKgFat' | 'gramsPerKgProtein'
  >,
): MacroNutrients => ({
  carbs: weight * savedMacroTarget.gramsPerKgCarbs,
  protein: weight * savedMacroTarget.gramsPerKgProtein,
  fat: weight * savedMacroTarget.gramsPerKgFat,
})

export const getMacroTargetForDay = (day: Date) => {
  const targetDayWeight_ = inForceWeight(userWeights(), day)?.weight ?? null
  const targetDayMacroProfile_ = inForceMacroProfile(userMacroProfiles(), day)

  if (targetDayWeight_ === null) {
    showError(new Error('Peso não encontrado para o dia atual'), {
      audience: 'system',
    })
    return null
  }

  if (targetDayMacroProfile_ === null) {
    showError(new Error('Perfil de macros não encontrado para o dia atual'), {
      audience: 'system',
    })
    return null
  }

  return calculateMacroTarget(targetDayWeight_, targetDayMacroProfile_)
}
