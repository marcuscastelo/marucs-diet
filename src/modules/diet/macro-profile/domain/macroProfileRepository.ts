import {
  type MacroProfile,
  type NewMacroProfile,
} from '~/modules/diet/macro-profile/domain/macroProfile'
import { type User } from '~/modules/user/domain/user'

export type MacroProfileRepository = {
  fetchUserMacroProfiles: (
    userId: User['id'],
  ) => Promise<readonly MacroProfile[]>
  insertMacroProfile: (
    newMacroProfile: NewMacroProfile,
  ) => Promise<MacroProfile | null>
  updateMacroProfile: (
    macroProfileId: MacroProfile['id'],
    newMacroProfile: NewMacroProfile,
  ) => Promise<MacroProfile | null>
  deleteMacroProfile: (id: MacroProfile['id']) => Promise<void>
}
