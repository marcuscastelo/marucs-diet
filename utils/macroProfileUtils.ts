import { MacroProfile } from '@/model/macroProfileModel'

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
  const firstProfileAfterDate = macroProfiles.findLast(
    (profile) => profile.target_day.getTime() <= date.getTime(),
  )

  if (!firstProfileAfterDate) {
    return null
  }

  return firstProfileAfterDate
}
