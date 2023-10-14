'use client'

import { fetchUserWeights } from '@/legacy/controllers/weights'
import { User } from '@/legacy/model/userModel'
import { Weight } from '@/legacy/model/weightModel'
import { Loadable } from '@/legacy/utils/loadable'
import { useCallback, useEffect, useState } from 'react'

// TODO: Bring useFetch hook to weights hook
export function useWeights(userId: User['id']) {
  const [weights, setWeights] = useState<Loadable<Weight[]>>({ loading: true })

  const handleRefetch = useCallback(() => {
    fetchUserWeights(userId).then((weights) =>
      setWeights({ loading: false, errored: false, data: weights }),
    )
  }, [userId])

  useEffect(() => {
    fetchUserWeights(userId).then((weights) =>
      setWeights({ loading: false, errored: false, data: weights }),
    )
  }, [userId])

  return {
    weights,
    refetch: handleRefetch,
  }
}
