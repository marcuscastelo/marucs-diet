'use client'

import { fetchUserMacroProfiles } from '@/legacy/controllers/macroProfiles'
import { MacroProfile } from '@/modules/macro-profile/domain/macroProfile'
import { User } from '@/modules/user/domain/user'
import { Loadable } from '@/legacy/utils/loadable'
import { useCallback, useEffect, useState } from 'react'

// TODO: Bring useFetch hook to weights hook
export function useMacroProfiles(userId: User['id']) {
  const [macroProfiles, setMacroProfiles] = useState<Loadable<MacroProfile[]>>({
    loading: true,
  })

  const handleRefetch = useCallback(() => {
    fetchUserMacroProfiles(userId).then((macroProfiles) =>
      setMacroProfiles({ loading: false, errored: false, data: macroProfiles }),
    )
  }, [userId])

  useEffect(() => {
    fetchUserMacroProfiles(userId).then((macroProfiles) =>
      setMacroProfiles({ loading: false, errored: false, data: macroProfiles }),
    )
  }, [userId])

  return {
    macroProfiles,
    refetch: handleRefetch,
  }
}
