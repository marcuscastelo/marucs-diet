// import { type MacroProfile } from '@/modules/diet/macro-profile/domain/macroProfile'
// import { inForceGeneric } from '@/legacy/utils/generic/inForce'

// export function latestMacroProfile (
//   macroProfiles: MacroProfile[],
//   reverseIndex = 0
// ) {
//   if (macroProfiles.length < reverseIndex + 1) {
//     return null
//   }

//   return macroProfiles[macroProfiles.length - (1 + reverseIndex)]
// }

// export function firstMacroProfile (macroProfiles: readonly MacroProfile[]) {
//   if (macroProfiles.length === 0) {
//     return null
//   }

//   return macroProfiles[0]
// }

// export function inForceMacroProfile (
//   macroProfiles: readonly MacroProfile[],
//   date: Date
// ) {
//   return inForceGeneric(macroProfiles, 'target_day', date)
// }
