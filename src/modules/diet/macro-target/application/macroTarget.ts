import { inForceWeight } from '~/legacy/utils/weightUtils'
import { type MacroNutrients } from '../../macro-nutrients/domain/macroNutrients'
import { type MacroProfile } from '../../macro-profile/domain/macroProfile'
import { userWeights } from '~/modules/weight/application/weight'
import { inForceMacroProfile } from '~/legacy/utils/macroProfileUtils'
import { userMacroProfiles } from '../../macro-profile/application/macroProfile'

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

export const macroTarget = (day: Date) => {
  const targetDayWeight_ = inForceWeight(userWeights(), day)?.weight ?? null
  const targetDayMacroProfile_ = inForceMacroProfile(userMacroProfiles(), day)

  if (targetDayWeight_ === null || targetDayMacroProfile_ === null) {
    return null
  }

  return calculateMacroTarget(targetDayWeight_, targetDayMacroProfile_)
}
