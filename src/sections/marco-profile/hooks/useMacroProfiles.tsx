import { fetchUserMacroProfiles } from '@/legacy/controllers/macroProfiles'
import { type MacroProfile } from '@/modules/diet/macro-profile/domain/macroProfile'
import { type User } from '@/modules/user/domain/user'
import { type Loadable } from '@/legacy/utils/loadable'
import { createEffect, createSignal } from 'solid-js'

// TODO: Bring useFetch hook to useMacroProfiles hook
export function useMacroProfiles (userId: User['id']) {
  const [macroProfiles, setMacroProfiles] = createSignal<Loadable<MacroProfile[]>>({
    loading: true
  })

  const handleRefetch = () => {
    fetchUserMacroProfiles(userId).then(
      (foundMacroProfiles) =>
        setMacroProfiles({
          loading: false,
          errored: false,
          data: foundMacroProfiles
        })
    ).catch((e) => {
      setMacroProfiles({
        loading: false,
        errored: true,
        error: e
      })
    })
  }

  createEffect(() => {
    fetchUserMacroProfiles(userId).then(
      (foundMacroProfiles) =>
        setMacroProfiles({
          loading: false,
          errored: false,
          data: foundMacroProfiles
        })
    ).catch((e) => {
      setMacroProfiles({
        loading: false,
        errored: true,
        error: e
      })
    })
  })

  return {
    macroProfiles,
    refetch: handleRefetch
  }
}
