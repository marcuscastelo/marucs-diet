import { type Loadable } from '~/legacy/utils/loadable'
import { createSignal } from 'solid-js'

export type FetchFunc<T, I, P extends I[]> = (...params: P) => Promise<T>

/**
 * @deprecated Should be replaced by use cases
 */
export function useFetch<T, I, P extends I[]>(fetchFunc: FetchFunc<T, I, P>) {
  const [data, setData] = createSignal<Loadable<T>>({ loading: true })

  const handleFetch = (...params: P) => {
    fetchFunc(...params)
      .then((newData) =>
        setData({ loading: false, errored: false, data: newData }),
      )
      .catch((error: unknown) =>
        setData({ loading: false, errored: true, error }),
      )
  }

  return {
    data,
    fetch: handleFetch,
  } as const
}
