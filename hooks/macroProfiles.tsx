'use client'

import { fetchUserMacroProfiles } from '@/controllers/macroProfiles'
import { MacroProfile } from '@/model/macroProfileModel'
import { User } from '@/model/userModel'
import { Loadable } from '@/utils/loadable'
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
