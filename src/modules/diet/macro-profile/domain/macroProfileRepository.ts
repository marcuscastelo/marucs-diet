import { type User } from '~/modules/user/domain/user'
import { type DbReady } from '~/legacy/utils/newDbRecord'
import { type MacroProfile } from '~/modules/diet/macro-profile/domain/macroProfile'

export type MacroProfileRepository = {
  fetchUserMacroProfiles: (
    userId: User['id'],
  ) => Promise<readonly MacroProfile[]>
  insertMacroProfile: (
    newWeight: DbReady<MacroProfile>,
  ) => Promise<MacroProfile>
  updateMacroProfile: (
    macroProfileId: MacroProfile['id'],
    newMacroProfile: DbReady<MacroProfile>,
  ) => Promise<MacroProfile>
  deleteMacroProfile: (id: MacroProfile['id']) => Promise<void>
}
