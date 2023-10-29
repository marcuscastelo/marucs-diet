'use client'

import { Loadable } from '@/legacy/utils/loadable'
import { ReadonlySignal, useSignal } from '@preact/signals-react'
import { useCallback } from 'react'

export type FetchFunc<T, I, P extends Array<I>> = (...params: P) => Promise<T>

/**
 * @deprecated Should be replaced by use cases
 */
export function useFetch<T, I, P extends Array<I>>(
  fetchFunc: FetchFunc<T, I, P>,
) {
  const data = useSignal<Loadable<T>>({ loading: true })

  const handleFetch = useCallback(
    (...params: P) => {
      fetchFunc(...params).then(
        (newData) =>
          (data.value = { loading: false, errored: false, data: newData }),
      )
    },
    [fetchFunc, data],
  )

  return {
    data: data as ReadonlySignal<Loadable<T>>,
    fetch: handleFetch,
  } as const
}
