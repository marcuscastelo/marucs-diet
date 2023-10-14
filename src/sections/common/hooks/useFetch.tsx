'use client'

import { Loadable } from '@/legacy/utils/loadable'
import { useCallback, useState } from 'react'

export type FetchFunc<T, P extends Array<any>> = (...params: P) => Promise<T>

export function useFetch<T, P extends Array<any>>(fetchFunc: FetchFunc<T, P>) {
  const [data, setData] = useState<Loadable<T>>({ loading: true })

  const handleFetch = useCallback(
    (...params: P) => {
      fetchFunc(...params).then((data) =>
        setData({ loading: false, errored: false, data }),
      )
    },
    [fetchFunc],
  )

  return {
    data,
    fetch: handleFetch,
  } as const
}
