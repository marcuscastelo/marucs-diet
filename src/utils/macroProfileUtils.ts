import { MacroProfile } from '@/model/macroProfileModel'
import { inForceGeneric } from '@/utils/generic/inForce'

export function latestMacroProfile(
  macroProfiles: MacroProfile[],
  reverseIndex = 0,
) {
  if (macroProfiles.length < reverseIndex + 1) {
    return null
  }

  return macroProfiles[macroProfiles.length - (1 + reverseIndex)]
}

export function firstMacroProfile(macroProfiles: MacroProfile[]) {
  if (macroProfiles.length === 0) {
    return null
  }

  return macroProfiles[0]
}

export function inForceMacroProfile(macroProfiles: MacroProfile[], date: Date) {
  return inForceGeneric(macroProfiles, 'target_day', date)
}
