import { MacroProfile } from '@/model/macroProfileModel'

export function latestMacroProfile(macroProfiles: MacroProfile[]) {
  if (macroProfiles.length === 0) {
    return null
  }
  return macroProfiles[macroProfiles.length - 1]
}

export function firstMacroProfile(macroProfiles: MacroProfile[]) {
  if (macroProfiles.length === 0) {
    return null
  }
  return macroProfiles[0]
}
