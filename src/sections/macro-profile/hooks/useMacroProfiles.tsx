'use client'

import { fetchUserMacroProfiles } from '@/legacy/controllers/macroProfiles'
import { MacroProfile } from '@/modules/diet/macro-profile/domain/macroProfile'
import { User } from '@/modules/user/domain/user'
import { Loadable } from '@/legacy/utils/loadable'
import { useCallback, useEffect } from 'react'
import { ReadonlySignal, useSignal } from '@preact/signals-react'

// TODO: Bring useFetch hook to useMacroProfiles hook
export function useMacroProfiles(userId: User['id']) {
  const macroProfiles = useSignal<Loadable<MacroProfile[]>>({
    loading: true,
  })

  const handleRefetch = useCallback(() => {
    fetchUserMacroProfiles(userId).then(
      (foundMacroProfiles) =>
        (macroProfiles.value = {
          loading: false,
          errored: false,
          data: foundMacroProfiles,
        }),
    )
  }, [userId, macroProfiles])

  useEffect(() => {
    fetchUserMacroProfiles(userId).then(
      (foundMacroProfiles) =>
        (macroProfiles.value = {
          loading: false,
          errored: false,
          data: foundMacroProfiles,
        }),
    )
  }, [userId, macroProfiles])

  return {
    macroProfiles: macroProfiles as ReadonlySignal<Loadable<MacroProfile[]>>,
    refetch: handleRefetch,
  }
}
