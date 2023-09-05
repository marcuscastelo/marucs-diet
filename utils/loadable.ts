export type Loading<T = Record<never, never>> = T & {
  loading: true
}

export type Loaded<T> = {
  loading: false
  errored: false
  data: T
}

export type Errored<T = Record<never, never>> = T & {
  loading: false
  errored: true
  error: Error
}

export type Loadable<
  TLoaded,
  TLoading = Record<never, never>,
  TErrored = Record<never, never>,
> = Loading<TLoading> | Loaded<TLoaded> | Errored<TErrored>

export type UnboxedLoadable<T extends { [key: string]: unknown }> = {
  [K in keyof T]: Loadable<T[K]>
}

// TODO: Fix this function! it is producing undefineds
export function unboxLoadingObject<TObj extends { [key: string]: unknown }>(
  loadableObject: Loadable<TObj>,
  keys: (keyof TObj)[],
): UnboxedLoadable<TObj> {
  if (loadableObject.loading) {
    const ret = keys.reduce((acc, key) => {
      acc[key] = { loading: true }
      return acc
    }, {} as UnboxedLoadable<TObj>) as UnboxedLoadable<TObj>
    return ret
  }

  if (loadableObject.errored) {
    const ret = keys.reduce((acc, key) => {
      acc[key] = {
        loading: false,
        errored: true,
        error: loadableObject.error,
      }
      return acc
    }, {} as UnboxedLoadable<TObj>)
    return ret
  }

  const ret = keys.reduce((acc, key) => {
    acc[key] = {
      loading: false,
      errored: false,
      data: loadableObject.data[key],
    }
    return acc
  }, {} as UnboxedLoadable<TObj>)
  return ret
}
