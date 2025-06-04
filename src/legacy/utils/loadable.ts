// TODO:   Use SolidJS Resource instead of Loadable

/**
 * @deprecated Should be replaced by SolidJS Resource
 */
export type Loading<T = Record<never, never>> = T & {
  loading: true
}

/**
 * @deprecated Should be replaced by SolidJS Resource
 */
export type Loaded<T> = {
  loading: false
  errored: false
  data: T
}

/**
 * @deprecated Should be replaced by SolidJS Resource
 */
export type Errored<T = Record<never, never>> = T & {
  loading: false
  errored: true
  error: unknown
}

/**
 * @deprecated Should be replaced by SolidJS Resource
 */
export type Loadable<
  TLoaded,
  TLoading = Record<never, never>,
  TErrored = Record<never, never>,
> = Loading<TLoading> | Loaded<TLoaded> | Errored<TErrored>
