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
